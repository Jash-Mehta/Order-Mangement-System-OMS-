import { Generated } from 'kysely';

export interface OrdersTable {
  id: Generated<string>;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
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