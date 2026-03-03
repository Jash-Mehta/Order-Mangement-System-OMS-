-- ========== INVENTORY TABLE ALTER ==========

ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS reserved_quantity integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS warehouse_id UUID,
ADD COLUMN IF NOT EXISTS low_stock_threshold integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS meta JSONB DEFAULT '{}'::jsonb;

ALTER TABLE inventory
ADD CONSTRAINT chk_reserved_qty_non_negative CHECK (reserved_quantity >= 0);

ALTER TABLE inventory
ADD CONSTRAINT chk_reserved_less_than_total CHECK (reserved_quantity <= total_quantity);

CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_inventory_bar_code ON inventory(bar_code);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);