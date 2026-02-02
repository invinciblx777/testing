-- Shiprocket Integration Schema Updates
-- Run this in Supabase SQL Editor

-- Add Shiprocket-specific columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_shipment_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_awb_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_courier_id INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_tracking_data JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_pickup_token TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_label_url TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_manifest_url TEXT;

-- Add index for faster lookups by AWB
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_awb ON orders(shiprocket_awb_code);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);

-- Comment: Run this migration in your Supabase SQL Editor
-- After running, verify columns exist with: SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';
