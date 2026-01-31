export interface InventoryTable {
  // Primary key
  product_id: string;

  // Product details
  name: string;
  brand_name?: string;
  bar_code?: string;
  image_url?: string;

  // Pricing
  price: number; // numeric(12,2) in DB

  // Batch & expiry details
  batch_no?: string;
  mfg_date?: Date;
  expiry_date?: Date;

  // Stock
  total_quantity: number;
  available_quantity: number;

  // Timestamps
  created_at: Date;
  updated_at: Date;
}

export interface InventoryReservationTypeTable{
  id: string;
  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  expires_at: Date;
  created_at: Date;
}