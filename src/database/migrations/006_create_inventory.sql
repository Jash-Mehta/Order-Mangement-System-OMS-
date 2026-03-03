CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS inventory (
  product_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  brand_name text,
  price numeric(12,2) NOT NULL,
  image_url text,
  bar_code text,
  mfg_date DATE,
  expiry_date DATE,
  batch_no text,
  total_quantity integer NOT NULL,
  available_quantity integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CHECK (total_quantity >= 0),
  CHECK (available_quantity >= 0),
  CHECK (available_quantity <= total_quantity)
);