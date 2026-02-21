-- User Repository Queries

-- Get user by ID
SELECT 
  id,
  name,
  email,
  password_hash,
  created_at,
  updated_at
FROM users
WHERE id = $1;

-- Get user by email
SELECT 
  id,
  name,
  email,
  password_hash,
  created_at,
  updated_at
FROM users
WHERE email = $1;

-- Get user with orders
SELECT 
  u.id,
  u.name,
  u.email,
  u.created_at as user_created_at,
  u.updated_at as user_updated_at,
  o.id as order_id,
  o.status as order_status,
  o.total_amount,
  o.created_at as order_created_at,
  o.updated_at as order_updated_at
FROM users u
LEFT JOIN orders o ON u.id = o.customer_id
WHERE u.id = $1
ORDER BY o.created_at DESC;

-- Check if email exists
SELECT COUNT(*) as count
FROM users
WHERE email = $1;
