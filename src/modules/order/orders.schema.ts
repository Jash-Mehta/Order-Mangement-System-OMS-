import { Generated } from 'kysely';

export interface OrdersTable {
  id: Generated<string>;
  customer_id: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  total_amount: number;
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface OrderDatabase {
  orders: OrdersTable;
}


export interface ItemOrderTable{
   id: Generated<string>;
   order_id: string;
   product_id: string;
   quantity: number;
   status: 'PENDING' | 'PAID' | 'CANCELLED';
   amount: number;
   rating?: number,
   review?: string,
   reviewed_at?:  Generated<Date>;
   expires_at: Generated<Date>;
   created_at: Generated<Date>;
}

export interface ItemOrderDatabase{
  orders_items: ItemOrderTable;
}