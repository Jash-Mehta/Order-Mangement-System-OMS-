CREATE TABLE IF NOT EXISTS refunds (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id BIGINT NOT NULL,

  razorpay_refund_id VARCHAR(100),
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('PENDING', 'PROCESSED', 'FAILED'),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
);
