-- Inventory Repository Queries

-- Get all inventory products
SELECT 
  id,
  name,
  brand_name,
  bar_code,
  image_url,
  price,
  batch_no,
  mfg_date,
  expiry_date,
  total_quantity,
  available_quantity,
  created_at,
  updated_at
FROM inventory
ORDER BY created_at DESC;

-- Get product by ID
SELECT 
  id,
  name,
  brand_name,
  bar_code,
  image_url,
  price,
  batch_no,
  mfg_date,
  expiry_date,
  total_quantity,
  available_quantity,
  created_at,
  updated_at
FROM inventory
WHERE id = $1;

-- Get all reservations
SELECT 
  ir.id,
  ir.order_id,
  ir.product_id,
  ir.quantity,
  ir.status,
  ir.expires_at,
  ir.created_at,
  ir.updated_at,
  i.name as product_name,
  i.brand_name
FROM inventory_reservations ir
LEFT JOIN inventory i ON ir.product_id = i.product_id
ORDER BY ir.created_at DESC;

-- Get reservations by order ID
SELECT 
  ir.id,
  ir.order_id,
  ir.product_id,
  ir.quantity,
  ir.status,
  ir.expires_at,
  ir.created_at,
  ir.updated_at,
  i.name as product_name,
  i.brand_name
FROM inventory_reservations ir
LEFT JOIN inventory i ON ir.product_id = i.product_id
WHERE ir.order_id = $1
ORDER BY ir.created_at ASC;
