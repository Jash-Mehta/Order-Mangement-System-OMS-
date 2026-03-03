ALTER TABLE orders_items
ADD COLUMN rating integer CHECK (rating BETWEEN 1 AND 5),
ADD COLUMN review text,

ADD COLUMN reviewed_at timestamptz;