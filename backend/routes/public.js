import { Router } from 'express';
import { randomInt } from 'node:crypto';
import { dateInTimezone, inTimezone, makeSlots, toDate } from '../services/availability.js';

const router = Router();
const activeStatuses = ['confirmed', 'pending'];

router.get('/services', async (req, res, next) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'The services database is not configured.' });
    }
    const { rows } = await req.db.query('SELECT id, name, category, description, duration_minutes AS "durationMinutes", price, currency FROM services WHERE active = true ORDER BY category, name');
    res.json({ services: rows });
  } catch (error) { next(error); }
});

router.get('/availability', async (req, res, next) => {
  try {
    if (!req.db) {
      return res.status(503).json({ error: 'The booking database is not configured.' });
    }
    const { serviceId, date, type = 'salon' } = req.query;
    const parsedDate = toDate(date);
    const validService = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(serviceId || '');
    if (!parsedDate || !validService || !['salon', 'vip'].includes(type)) return res.status(400).json({ error: 'اختاري الخدمة والتاريخ ونوع الحجز بشكل صحيح.' });
    if (date < dateInTimezone(new Date(), process.env.BUSINESS_TIMEZONE || 'Asia/Hebron')) return res.status(400).json({ error: 'اختاري تاريخاً من اليوم أو بعده.' });
    const { rows: services } = await req.db.query('SELECT duration_minutes FROM services WHERE id = $1 AND active = true', [serviceId]);
    if (!services[0]) return res.status(404).json({ error: 'هذه الخدمة غير متاحة حالياً.' });
    const weekday = parsedDate.getUTCDay();
    const { rows: hours } = await req.db.query('SELECT opens::text, closes::text, closed FROM opening_hours WHERE weekday = $1', [weekday]);
    if (!hours[0] || hours[0].closed) return res.json({ slots: [] });
    const { rows: floorBookings } = await req.db.query(
      `SELECT starts_at, ends_at FROM appointments WHERE status = ANY($1::text[]) AND vip_floor = true AND starts_at < (($2::date + interval '1 day') AT TIME ZONE $3) AND ends_at > ($2::date::timestamp AT TIME ZONE $3)`,
      [activeStatuses, date, process.env.BUSINESS_TIMEZONE || 'Asia/Hebron'],
    );
    const { rows: teamRows } = await req.db.query(
      `SELECT s.id, sh.opens::text, sh.closes::text FROM staff s JOIN staff_services ss ON ss.staff_id = s.id JOIN staff_hours sh ON sh.staff_id = s.id AND sh.weekday = $2 AND sh.closed = false WHERE s.active = true AND ss.service_id = $1`,
      [serviceId, weekday],
    );
    const { rows: staffBookings } = await req.db.query(
      `SELECT staff_id, starts_at, ends_at FROM appointments WHERE status = ANY($1::text[]) AND staff_id = ANY($2::uuid[]) AND starts_at < (($3::date + interval '1 day') AT TIME ZONE $4) AND ends_at > ($3::date::timestamp AT TIME ZONE $4)`,
      [activeStatuses, teamRows.map((member) => member.id), date, process.env.BUSINESS_TIMEZONE || 'Asia/Hebron'],
    );
    const staff = teamRows.map((member) => ({ ...member, booked: staffBookings.filter((item) => item.staff_id === member.id) }));
    const slots = makeSlots({ date, open: hours[0].opens, close: hours[0].closes, duration: services[0].duration_minutes, booked: type === 'vip' ? floorBookings : [], staff, requireStaff: true, timezone: process.env.BUSINESS_TIMEZONE || 'Asia/Hebron' });
    res.json({ slots });
  } catch (error) { next(error); }
});

router.post('/bookings', async (req, res, next) => {
  if (!req.db) {
    return res.status(503).json({ error: 'The booking database is not configured.' });
  }
  const { serviceId, date, time, type = 'salon', name, phone, email = '', notes = '' } = req.body || {};
  const parsedDate = toDate(date);
  const validService = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(serviceId || '');
  if (!validService || !parsedDate || !/^\d{2}:\d{2}$/.test(time || '') || !['salon', 'vip'].includes(type) || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 120 || typeof phone !== 'string' || phone.trim().length < 7 || phone.trim().length > 40 || (email && (typeof email !== 'string' || email.length > 254)) || typeof notes !== 'string' || notes.length > 1000) return res.status(400).json({ error: 'تحققي من معلومات الحجز وحاولي مرة أخرى.' });
  const [hour, minute] = time.split(':').map(Number);
  if (hour > 23 || minute > 59 || date < dateInTimezone(new Date(), process.env.BUSINESS_TIMEZONE || 'Asia/Hebron')) return res.status(400).json({ error: 'التاريخ أو الوقت غير صالح.' });

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [date]);
    const { rows } = await client.query('SELECT id, name, duration_minutes, price, currency FROM services WHERE id = $1 AND active = true FOR SHARE', [serviceId]);
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'هذه الخدمة غير متاحة حالياً.' }); }
    const weekday = parsedDate.getUTCDay();
    const { rows: opening } = await client.query('SELECT opens::text, closes::text, closed FROM opening_hours WHERE weekday = $1', [weekday]);
    if (!opening[0] || opening[0].closed) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'الصالون مغلق في هذا اليوم.' }); }
    const duration = rows[0].duration_minutes;
    const startMinute = hour * 60 + minute;
    const [openHour, openMinute] = opening[0].opens.split(':').map(Number);
    const [closeHour, closeMinute] = opening[0].closes.split(':').map(Number);
    if (startMinute < openHour * 60 + openMinute || startMinute + duration > closeHour * 60 + closeMinute || startMinute % 30 !== 0) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'هذا الوقت خارج أوقات الحجز المتاحة.' }); }
    const startsAt = inTimezone(date, time, process.env.BUSINESS_TIMEZONE || 'Asia/Hebron');
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);
    if (startsAt <= new Date()) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'انتهى الوقت المحدد. اختاري موعداً آخر.' }); }
    if (type === 'vip') {
      const { rows: floorConflicts } = await client.query('SELECT id FROM appointments WHERE status = ANY($1::text[]) AND vip_floor = true AND starts_at < $3 AND ends_at > $2 LIMIT 1', [activeStatuses, startsAt, endsAt]);
      if (floorConflicts.length) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'حُجز هذا الوقت للتو. اختاري وقتاً متاحاً آخر.' }); }
    }
    const { rows: team } = await client.query(
      `SELECT s.id FROM staff s JOIN staff_services ss ON ss.staff_id = s.id JOIN staff_hours sh ON sh.staff_id = s.id AND sh.weekday = $2 AND sh.closed = false WHERE s.active = true AND ss.service_id = $1 AND sh.opens <= $3::time AND sh.closes >= ($3::time + ($4::int * interval '1 minute')) ORDER BY s.id FOR UPDATE OF s SKIP LOCKED`,
      [serviceId, weekday, time, duration],
    );
    let assignedStaff = null;
    for (const member of team) {
      const { rows: conflicts } = await client.query('SELECT id FROM appointments WHERE staff_id = $1 AND status = ANY($2::text[]) AND starts_at < $4 AND ends_at > $3 LIMIT 1', [member.id, activeStatuses, startsAt, endsAt]);
      if (!conflicts.length) { assignedStaff = member.id; break; }
    }
    if (!assignedStaff) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'لا يتوفر مختص لهذه الخدمة في الوقت المحدد. اختاري موعداً آخر.' }); }
    const bookingNumber = `BV-${new Date().getFullYear()}-${String(randomInt(0, 1_000_000)).padStart(6, '0')}`;
    await client.query(`INSERT INTO appointments (booking_number, customer_name, phone, email, service_id, staff_id, starts_at, ends_at, booking_type, vip_floor, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [bookingNumber, name.trim(), phone.trim(), email.trim() || null, serviceId, assignedStaff, startsAt, endsAt, type, type === 'vip', notes.trim()]);
    await client.query('COMMIT');
    res.status(201).json({ booking: { bookingNumber, customerName: name.trim(), serviceName: rows[0].name, date, time, type } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.code === '23P01') return res.status(409).json({ error: 'حُجز هذا الوقت للتو. اختاري وقتاً متاحاً آخر.' });
    next(error);
  }
  finally { client.release(); }
});

export default router;
