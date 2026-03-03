-- Order Repository Queries

-- Get all orders with items and inventory details
SELECT 
  oi.id as item_id,
  oi.order_id,
  oi.product_id,
  oi.quantity,
  oi.amount,
  oi.status as item_status,
  oi.expires_at,
  oi.created_at as item_created_at,
  oi.rating,
  oi.review,
  oi.reviewed_at,
  o.id as order_id,
  o.customer_id,
  o.status as order_status,
  o.total_amount,
  o.created_at as order_created_at,
  o.updated_at,
  i.product_id as inventory_product_id,
  i.name as product_name,
  i.brand_name,
  i.bar_code,
  i.image_url,
  i.price as inventory_price,
  i.batch_no,
  i.mfg_date,
  i.expiry_date as inventory_expiry_date,
  i.total_quantity as inventory_total_quantity,
  i.available_quantity as inventory_available_quantity
FROM orders_items oi
INNER JOIN orders o ON o.id = oi.order_id
LEFT JOIN inventory i ON i.product_id = oi.product_id
ORDER BY o.created_at DESC, oi.created_at ASC;

-- Get order by ID with items
SELECT 
  o.id,
  o.customer_id,
  o.status,
  o.total_amount,
  o.created_at,
  o.updated_at,
  oi.id as item_id,
  oi.product_id,
  oi.quantity,
  oi.amount,
  oi.status as item_status,
  oi.expires_at,
  oi.created_at as item_created_at,
  oi.rating,
  oi.review,
  oi.reviewed_at
FROM orders o
LEFT JOIN orders_items oi ON o.id = oi.order_id
WHERE o.id = $1
ORDER BY oi.created_at ASC;

-- Get orders by customer ID
SELECT 
  o.id,
  o.customer_id,
  o.status,
  o.total_amount,
  o.created_at,
  o.updated_at
FROM orders o
WHERE o.customer_id = $1
ORDER BY o.created_at DESC;
