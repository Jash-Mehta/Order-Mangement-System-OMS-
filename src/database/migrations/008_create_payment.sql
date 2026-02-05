CREATE TABLE IF NOT EXISTS  payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  order_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,

  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  razorpay_signature VARCHAR(255),

  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',

  status ENUM(
    'CREATED',
    'AUTHORIZED',
    'CAPTURED',
    'FAILED',
    'REFUNDED'
  ) NOT NULL,

  failure_reason TEXT NULL,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
