import { Generated } from 'kysely';

export interface InventoryReservationTable {
  id: Generated<string>;

  order_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  expires_at: Date;

  created_at: Generated<Date>;
}

export interface InventoryReservationDatabase {
  inventory_reservations: InventoryReservationTable;
}