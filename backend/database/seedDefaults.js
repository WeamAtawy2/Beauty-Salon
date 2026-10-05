import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const serviceCatalog = [
  { name: 'قص وتصفيف', category: 'الشعر', description: 'تجهيز الشعر مع لمسة نهائية أنيقة ومناسبة للوقائع اليومية.', duration_minutes: 60, price: 120 },
  { name: 'مكياج عروس', category: 'العروس', description: 'إطلالة عروس فاخرة مع لمسة إضاءة دقيقة ومخصصة للحدث.', duration_minutes: 120, price: 450 },
  { name: 'عناية البشرة', category: 'العناية', description: 'جلسة ترطيب وتنشيط للعناية اليومية وتفتيح البشرة.', duration_minutes: 45, price: 180 },
  { name: 'تنسيق الحواجب', category: 'الحواجب', description: 'تحديد وتعليق الحواجب لإبراز الوجه بطريقة طبيعية.', duration_minutes: 30, price: 90 },
  { name: 'برايمر مكياج', category: 'المكياج', description: 'جلسة إعداد وجهية مع لمسة مكياج نهائية لطيفة ومناسبة لأي مناسبة.', duration_minutes: 50, price: 200 },
  { name: 'جلسة بلسم وتجميل', category: 'الشعر', description: 'عناية عميقة للشعر مع لمسة تجميل وتنعيم أنيقة.', duration_minutes: 75, price: 250 },
];

const staffCatalog = ['دنيا', 'سارة', 'لين'];

export async function initializeDefaultData(dbPool) {
  if (!dbPool) return false;

  try {
    const { rows: existing } = await dbPool.query('SELECT COUNT(*)::int AS count FROM services');
    if (existing[0]?.count > 0) return true;

    const serviceIds = [];
    for (const service of serviceCatalog) {
      const { rows } = await dbPool.query(
        `INSERT INTO services (name, category, description, duration_minutes, price, currency, active)
         VALUES ($1, $2, $3, $4, $5, 'ILS', true)
         RETURNING id`,
        [service.name, service.category, service.description, service.duration_minutes, service.price],
      );
      serviceIds.push(rows[0].id);
    }

    const staffIds = [];
    for (const name of staffCatalog) {
      const { rows } = await dbPool.query(
        `INSERT INTO staff (name, active)
         VALUES ($1, true)
         RETURNING id`,
        [name],
      );
      staffIds.push(rows[0].id);
    }

    for (const [index, serviceId] of serviceIds.entries()) {
      const staffId = staffIds[index % staffIds.length];
      await dbPool.query(
        `INSERT INTO staff_services (staff_id, service_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [staffId, serviceId],
      );
    }

    await dbPool.query(
      `INSERT INTO opening_hours (weekday, opens, closes, closed)
       VALUES
         (0, '10:00', '18:00', false),
         (1, '10:00', '18:00', false),
         (2, '10:00', '18:00', false),
         (3, '10:00', '18:00', false),
         (4, '10:00', '18:00', false),
         (5, '10:00', '18:00', false),
         (6, '10:00', '18:00', false)
       ON CONFLICT (weekday) DO NOTHING`,
    );

    for (const staffId of staffIds) {
      for (let weekday = 0; weekday <= 6; weekday += 1) {
        await dbPool.query(
          `INSERT INTO staff_hours (staff_id, weekday, opens, closes, closed)
           VALUES ($1, $2, '10:00', '18:00', false)
           ON CONFLICT (staff_id, weekday) DO NOTHING`,
          [staffId, weekday],
        );
      }
    }

    return true;
  } catch (error) {
    console.warn('Default salon seed skipped:', error.message);
    return false;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const connection = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  });

  try {
    const started = await initializeDefaultData(connection);
    console.log(started ? 'Seeded default salon data.' : 'No database configured or seed not needed.');
  } finally {
    await connection.end();
  }
}
