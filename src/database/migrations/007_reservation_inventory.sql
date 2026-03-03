CREATE TABLE IF NOT EXISTS inventory_reservations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,

  quantity integer NOT NULL,
  expires_at timestamptz NOT NULL,

  created_at timestamptz NOT NULL DEFAULT now(),

  CHECK (quantity > 0),
  UNIQUE (order_id, product_id)
);