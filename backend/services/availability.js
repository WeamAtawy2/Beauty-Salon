export function toDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function dateInTimezone(instant = new Date(), timezone = 'Asia/Hebron') {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function inTimezone(date, time, timezone = 'Asia/Hebron') {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let instant = target;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  for (let i = 0; i < 3; i += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map(({ type, value }) => [type, Number(value)]));
    const represented = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    instant += target - represented;
  }
  return new Date(instant);
}

export function makeSlots({ date, open, close, duration, booked = [], staff = [], requireStaff = false, step = 30, timezone = 'Asia/Hebron' }) {
  if (!open || !close || !duration) return [];
  const [oh, om] = open.split(':').map(Number);
  const [ch, cm] = close.split(':').map(Number);
  const startMin = oh * 60 + om;
  const endMin = ch * 60 + cm;
  const now = new Date();
  const result = [];
  for (let minute = startMin; minute + duration <= endMin; minute += step) {
    const hh = String(Math.floor(minute / 60)).padStart(2, '0');
    const mm = String(minute % 60).padStart(2, '0');
    const startsAt = inTimezone(date, `${hh}:${mm}`, timezone);
    const label = startsAt.toLocaleTimeString('ar', { hour: 'numeric', minute: '2-digit', timeZone: timezone });
    if (startsAt <= now) continue;
    const endsAt = new Date(startsAt.getTime() + duration * 60_000);
    const conflict = booked.some((item) => startsAt < new Date(item.ends_at) && endsAt > new Date(item.starts_at));
    const staffAvailable = !requireStaff || staff.some((person) => {
      const [staffOpenHour, staffOpenMinute] = person.opens.split(':').map(Number);
      const [staffCloseHour, staffCloseMinute] = person.closes.split(':').map(Number);
      const from = staffOpenHour * 60 + staffOpenMinute;
      const until = staffCloseHour * 60 + staffCloseMinute;
      return minute >= from && minute + duration <= until && !person.booked.some((item) => startsAt < new Date(item.ends_at) && endsAt > new Date(item.starts_at));
    });
    if (!conflict && staffAvailable) result.push({ time: `${hh}:${mm}`, label });
  }
  return result;
}
