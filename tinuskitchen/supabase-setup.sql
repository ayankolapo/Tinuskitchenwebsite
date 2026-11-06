-- ══════════════════════════════════════════════════════
-- Tinu's Kitchen Bistro — Complete Supabase Database Setup
-- Run this entire script in your Supabase SQL Editor
-- ══════════════════════════════════════════════════════

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ══════════════════════════════════════════════════════
-- 1. ORDERS TABLE
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference        TEXT UNIQUE NOT NULL,
  customer_name    TEXT NOT NULL,
  customer_phone   TEXT NOT NULL,
  customer_email   TEXT,
  items            JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount     NUMERIC(10,2) NOT NULL,
  delivery_type    TEXT NOT NULL CHECK (delivery_type IN ('delivery','pickup')),
  delivery_address TEXT,
  location_zone    TEXT,
  delivery_fee     NUMERIC(10,2) DEFAULT 0.00,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  payment_status   TEXT NOT NULL DEFAULT 'paid'
                   CHECK (payment_status IN ('pending','paid','failed','refunded')),
  paid_at          TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at     TIMESTAMPTZ,
  ready_at         TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════
-- 2. DELIVERY ZONES TABLE
-- ══════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS delivery_zones (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name            TEXT NOT NULL,
  time_estimate   TEXT NOT NULL DEFAULT '30 – 45 mins',
  fee             NUMERIC(10,2) NOT NULL DEFAULT 1000.00,
  active          BOOLEAN NOT NULL DEFAULT true,
  display_order   INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default delivery zones with start prices
CREATE UNIQUE INDEX IF NOT EXISTS delivery_zones_name_idx ON delivery_zones (name);

INSERT INTO delivery_zones (name, time_estimate, fee, active, display_order)
VALUES
  ('Nnobi & outside IPaye', '15 – 25 mins', 1000.00, true, 1),
  ('Inside ipaye', '20 – 30 mins', 1500.00, true, 2),
  ('Iba housing', '20 – 30 mins', 1500.00, true, 3),
  ('Shonibare / peace Estate', '20 – 30 mins', 1500.00, true, 4),
  ('Iyana school', '25 – 35 mins', 2000.00, true, 5),
  ('Agboroko', '25 – 35 mins', 2000.00, true, 6),
  ('Iba Junction', '25 – 35 mins', 2000.00, true, 7),
  ('Aratumi', '25 – 35 mins', 2000.00, true, 8),
  ('pakunola/mosadolohun/taleloju', '25 – 35 mins', 2000.00, true, 9),
  ('Igbo elerin', '30 – 45 mins', 2500.00, true, 10),
  ('PPL', '30 – 45 mins', 2500.00, true, 11),
  ('Post Serice', '30 – 45 mins', 2500.00, true, 12),
  ('Iyana Isashi', '35 – 50 mins', 3000.00, true, 13),
  ('Obadore', '35 – 50 mins', 3000.00, true, 14),
  ('Akesan Axis', '40 – 55 mins', 3000.00, true, 15)
ON CONFLICT (name) DO UPDATE
SET
  fee = EXCLUDED.fee,
  time_estimate = EXCLUDED.time_estimate,
  active = EXCLUDED.active,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ══════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ══════════════════════════════════════════════════════
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public select orders by reference" ON orders;
DROP POLICY IF EXISTS "Public read active delivery zones" ON delivery_zones;
DROP POLICY IF EXISTS "Service role full access orders" ON orders;
DROP POLICY IF EXISTS "Service role full access delivery zones" ON delivery_zones;

-- Orders: Public can select to track order by reference
CREATE POLICY "Public select orders by reference"
  ON orders FOR SELECT
  USING (true);

-- Delivery Zones: Public can view delivery zones for checkout calculation
CREATE POLICY "Public read active delivery zones"
  ON delivery_zones FOR SELECT
  USING (true);

-- Note: The Netlify backend uses the SUPABASE_SERVICE_ROLE_KEY which automatically
-- bypasses RLS to perform INSERT, UPDATE, and DELETE operations securely.

-- ══════════════════════════════════════════════════════
-- 4. PERFORMANCE INDEXES
-- ══════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS orders_reference_idx ON orders (reference);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS delivery_zones_order_idx ON delivery_zones (display_order ASC);
CREATE INDEX IF NOT EXISTS delivery_zones_active_idx ON delivery_zones (active);

-- ══════════════════════════════════════════════════════
-- 5. REALTIME REPLICATION (Optional: Push live kitchen updates)
-- ══════════════════════════════════════════════════════
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;
END $$;
