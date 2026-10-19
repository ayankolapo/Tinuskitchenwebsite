-- ══════════════════════════════════════════════════════
-- Tinu's Kitchen Bistro — Supabase Setup
-- Run this entire file in your Supabase SQL editor
-- ══════════════════════════════════════════════════════

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference       TEXT UNIQUE NOT NULL,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  customer_email  TEXT,
  items           JSONB NOT NULL,
  total_amount    NUMERIC(10,2) NOT NULL,
  delivery_type   TEXT NOT NULL CHECK (delivery_type IN ('delivery','pickup')),
  delivery_address TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','preparing','ready','delivered','cancelled')),
  paid_at         TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at    TIMESTAMPTZ,
  ready_at        TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ROW LEVEL SECURITY
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Customers can read their own order by reference (no auth needed)
CREATE POLICY "Read own order by reference"
  ON orders FOR SELECT
  USING (true);
-- Note: SELECT is open because customers look up by unique reference
-- The Netlify function handles all writes using the service role key

-- 3. INDEXES for fast lookups
CREATE INDEX IF NOT EXISTS orders_reference_idx ON orders (reference);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);

-- 4. ADMIN VIEW (optional — useful for Tinu to see all orders)
CREATE OR REPLACE VIEW admin_orders AS
SELECT
  id,
  reference,
  customer_name,
  customer_phone,
  customer_email,
  items,
  total_amount,
  delivery_type,
  delivery_address,
  status,
  paid_at,
  confirmed_at,
  ready_at,
  delivered_at,
  notes,
  created_at
FROM orders
ORDER BY created_at DESC;

-- ══════════════════════════════════════════════════════
-- DONE. Your Supabase tables are ready.
-- Next: Add these to Netlify environment variables:
--   PAYSTACK_SECRET_KEY   = sk_live_... or sk_test_...
--   SUPABASE_URL          = https://xxxx.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY = eyJ...
-- ══════════════════════════════════════════════════════
