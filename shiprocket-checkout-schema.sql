-- ============================================
-- SHIPROCKET CHECKOUT INTEGRATION SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add weight to product_sizes (required for shipping calculation)
ALTER TABLE public.product_sizes 
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2) DEFAULT 0.5;

-- 2. Add vendor and product_type to products (for catalog sync)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS vendor TEXT DEFAULT 'Kurtis Boutique';

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS product_type TEXT;

-- 3. Shiprocket Orders Table (stores webhook order data)
CREATE TABLE IF NOT EXISTS public.shiprocket_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shiprocket_order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  items JSONB NOT NULL,
  phone TEXT,
  email TEXT,
  payment_type TEXT, -- 'prepaid' or 'cod'
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'paid',
  shipping_address JSONB,
  raw_webhook_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes for shiprocket_orders
CREATE INDEX IF NOT EXISTS idx_shiprocket_orders_user ON public.shiprocket_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_shiprocket_orders_order_id ON public.shiprocket_orders(shiprocket_order_id);
CREATE INDEX IF NOT EXISTS idx_shiprocket_orders_status ON public.shiprocket_orders(status);

-- 5. RLS for shiprocket_orders
ALTER TABLE public.shiprocket_orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
DROP POLICY IF EXISTS "Users can view own shiprocket orders" ON public.shiprocket_orders;
CREATE POLICY "Users can view own shiprocket orders" ON public.shiprocket_orders
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Admin can manage all orders
DROP POLICY IF EXISTS "Admin can manage shiprocket orders" ON public.shiprocket_orders;
CREATE POLICY "Admin can manage shiprocket orders" ON public.shiprocket_orders
  FOR ALL USING (public.is_admin());

-- Service role can insert (for webhook)
DROP POLICY IF EXISTS "Service role can insert shiprocket orders" ON public.shiprocket_orders;
CREATE POLICY "Service role can insert shiprocket orders" ON public.shiprocket_orders
  FOR INSERT WITH CHECK (true);

-- 6. Updated_at trigger for shiprocket_orders
DROP TRIGGER IF EXISTS set_shiprocket_orders_updated_at ON public.shiprocket_orders;
CREATE TRIGGER set_shiprocket_orders_updated_at 
  BEFORE UPDATE ON public.shiprocket_orders 
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SCHEMA READY
-- ============================================
