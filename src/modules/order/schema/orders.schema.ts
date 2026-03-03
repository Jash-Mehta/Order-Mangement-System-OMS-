import { Generated } from 'kysely';

export interface OrdersTable {
  id: Generated<string>;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
  
  // New fields from migration 010
  order_number?: string;
  currency?: string;
  payment_status?: string;
  payment_method?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  
  // Shipping fields
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pincode?: string;
  shipping_country?: string;
  
  // Courier and tracking
  courier_name?: string;
  tracking_number?: string;
  shipped_at?: Generated<Date>;
  delivered_at?: Generated<Date>;
  
  // Cancellation fields
  cancelled_at?: Generated<Date>;
  cancel_reason?: string;
  
  // Metadata
  meta?: Record<string, any>;
}

export interface OrderDatabase {
  orders: OrdersTable;
}


export interface ItemOrderTable {
  id: Generated<string>;
  order_id: string;
  product_id: string;
  quantity: number;
  status: OrderStatus;
  amount: number;
  rating?: number,
  review?: string,
  reviewed_at?: Generated<Date>;
  expires_at: Generated<Date>;
  created_at: Generated<Date>;
  
  // New fields from migration 011
  product_name?: string;
  unit_price?: number;
  total_price?: number; // Generated column
  shipment_status?: string;
  shipped_at?: Generated<Date>;
  delivered_at?: Generated<Date>;
  is_returned?: boolean;
  returned_at?: Generated<Date>;
}

export interface ItemOrderDatabase {
  orders_items: ItemOrderTable;
}

export type OrderStatus = 'PENDING' |
  'PAID' |
  'CANCELLED' |
  'REFUNDED' |
  'COMPLETED' |
  'EXPIRED' |
  'IN_PROGRESS' |
  'DELIVERED' |
  'RETURNED' |
  'FAILED' |
  'RESERVED_INVENTORY' |
  'AWAITING_PAYMENT' |
  'PARTIALLY_PAID' |
  'PARTIALLY_REFUNDED' |
  'CANCELLING' |
  'CANCELLED_BY_CUSTOMER' |
  'CANCELLED_BY_SELLER' |
  'CANCELLED_BY_SYSTEM' |
  'RETURN_REQUESTED' |
  'RETURN_APPROVED' |
  'RETURN_REJECTED' |
  'RETURN_RECEIVED' |
  'RETURN_COMPLETED';