import { Insertable, Selectable } from 'kysely';
import { orderDB, itemOrderDB, inventoryDB, pgPool } from '../../../database';
import { ItemOrderDatabase, ItemOrderTable, OrdersTable } from '../orders.schema';
import { TABLES } from '../../../database/table_name';

export type Order = Selectable<OrdersTable>;
export type NewOrder = Insertable<OrdersTable>;

export type ItemsOrders = Selectable<ItemOrderTable>;
export type NewItemsOrders = Insertable<ItemOrderTable>;

export class OrderRepository {

  async create(order: NewOrder): Promise<Order> {
    return await orderDB
      .insertInto('orders')
      .values(order)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getById(id: string): Promise<Order | null> {
    const row = await orderDB
      .selectFrom('orders')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!row) return null;

    return {
      id: row.id,
      customer_id: row.customer_id,
      status: row.status,
      total_amount: row.total_amount,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async getAll(customer_id: string): Promise<Order[]> {
    const rows = await orderDB
      .selectFrom('orders')
      .selectAll()
      .where('customer_id', '=', customer_id)
      .execute();

    return rows;
  }

  async createOrdersItems(itemsOrders: NewItemsOrders): Promise<ItemsOrders> {
    return await itemOrderDB.insertInto(TABLES.ORDERS_ITEMS)
    .values(itemsOrders)
    .returningAll()
    .executeTakeFirstOrThrow();
  }

  async getAllOrdersCreated(): Promise<any[]> {
    const query = `
      SELECT 
        oi.id as item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.amount,
        oi.status as item_status,
        oi.expires_at,
        oi.created_at as item_created_at,
        oi.rating,
        oi.review,
        oi.reviewed_at,
        o.id as order_id,
        o.customer_id,
        o.status as order_status,
        o.total_amount,
        o.created_at as order_created_at,
        o.updated_at,
        i.product_id as inventory_product_id,
        i.name as product_name,
        i.brand_name,
        i.bar_code,
        i.image_url,
        i.price as inventory_price,
        i.batch_no,
        i.mfg_date,
        i.expiry_date as inventory_expiry_date,
        i.total_quantity as inventory_total_quantity,
        i.available_quantity as inventory_available_quantity
      FROM orders_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      LEFT JOIN inventory i ON i.product_id = oi.product_id
      ORDER BY o.created_at DESC, oi.created_at ASC
    `;
    
    const { rows } = await pgPool.query(query);
    return rows;
  }


}
