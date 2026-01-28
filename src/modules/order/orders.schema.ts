import { Generated } from 'kysely';

export interface OrdersTable {
  id: Generated<number>;
  customer_id: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  total_amount: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface OrderDatabase {
  orders: OrdersTable;
}