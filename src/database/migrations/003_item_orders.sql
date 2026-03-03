CREATE TABLE IF NOT EXISTS orders_items(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL,
product_id uuid NOT NULL,
quantity integer NOT NULL,
status text NOT NULL,
expires_at timestamptz NOT NULL,
created_at timestamptz DEFAULT now()
);
