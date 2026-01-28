import { Insertable, Selectable } from 'kysely';
import { orderDB } from '../../../database';
import { OrdersTable } from '../orders.schema';

export type Order = Selectable<OrdersTable>;
export type NewOrder = Insertable<OrdersTable>;

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
}
