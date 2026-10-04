CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 10 AND 720),
  price NUMERIC(10,2),
  currency CHAR(3) NOT NULL DEFAULT 'ILS',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff_services (
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (staff_id, service_id)
);

CREATE TABLE IF NOT EXISTS opening_hours (
  weekday SMALLINT PRIMARY KEY CHECK (weekday BETWEEN 0 AND 6),
  opens TIME NOT NULL,
  closes TIME NOT NULL,
  closed BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS staff_hours (
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  opens TIME NOT NULL,
  closes TIME NOT NULL,
  closed BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (staff_id, weekday)
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_id UUID NOT NULL REFERENCES services(id),
  staff_id UUID REFERENCES staff(id),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('salon', 'vip')),
  vip_floor BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'pending')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS appointments_active_time_idx ON appointments(starts_at, ends_at)
  WHERE status IN ('confirmed', 'pending');
CREATE INDEX IF NOT EXISTS appointments_staff_time_idx ON appointments(staff_id, starts_at, ends_at)
  WHERE staff_id IS NOT NULL AND status IN ('confirmed', 'pending');

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_staff_no_overlap') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_staff_no_overlap
      EXCLUDE USING gist (staff_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
      WHERE (staff_id IS NOT NULL AND status IN ('confirmed', 'pending'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_vip_floor_no_overlap') THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_vip_floor_no_overlap
      EXCLUDE USING gist (vip_floor WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
      WHERE (vip_floor = true AND status IN ('confirmed', 'pending'));
  END IF;
END $$;
