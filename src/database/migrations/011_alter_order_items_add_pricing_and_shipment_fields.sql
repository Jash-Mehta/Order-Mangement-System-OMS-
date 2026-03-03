-- Add pricing and shipment fields to orders_items table
ALTER TABLE orders_items
ADD COLUMN IF NOT EXISTS product_name TEXT,
ADD COLUMN IF NOT EXISTS unit_price numeric(12,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_price numeric(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,
ADD COLUMN IF NOT EXISTS shipment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
ADD COLUMN IF NOT EXISTS is_returned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS returned_at timestamptz;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON orders_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON orders_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON orders_items(status);
CREATE INDEX IF NOT EXISTS idx_order_items_shipment_status ON orders_items(shipment_status);