-- Payment Repository Queries

-- Get payment by order ID
SELECT 
  id,
  order_id,
  user_id,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  amount,
  currency,
  status,
  failure_reason,
  created_at,
  updated_at
FROM payments
WHERE order_id = $1;

-- Get payment by Razorpay payment ID
SELECT 
  id,
  order_id,
  user_id,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  amount,
  currency,
  status,
  failure_reason,
  created_at,
  updated_at
FROM payments
WHERE razorpay_payment_id = $1;

-- Get all payments by user ID
SELECT 
  id,
  order_id,
  user_id,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  amount,
  currency,
  status,
  failure_reason,
  created_at,
  updated_at
FROM payments
WHERE user_id = $1
ORDER BY created_at DESC;

-- Get all refunds by payment ID
SELECT 
  r.id,
  r.payment_id,
  r.razorpay_refund_id,
  r.amount,
  r.status,
  r.created_at,
  p.razorpay_payment_id,
  p.order_id
FROM refunds r
INNER JOIN payments p ON r.payment_id = p.id
WHERE r.payment_id = $1
ORDER BY r.created_at DESC;
