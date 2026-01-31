import { Insertable, Selectable, sql } from "kysely";
import { InventoryTable } from "../inventory.schema";
import { inventoryDB, pgPool, reservationInventoryDB, itemOrderDB } from '../../../database';
import { TABLES } from "../../../database/table_name";
import { InventoryReservationTable } from "../inventory.reservation.schema";

export type Inventory = Selectable<InventoryTable>;
export type NewInventory = Insertable<InventoryTable>;

export type InventoryReservation = Selectable<InventoryReservationTable>;
export type NewInventoryReservation = Insertable<InventoryReservationTable>;

export class InventoryRepositories {
    // Inventory 
    async createInventory(inventory: NewInventory): Promise<Inventory> {

        return await inventoryDB.insertInto(TABLES.INVENTORY).values(inventory).returningAll().executeTakeFirstOrThrow();
    }

    async findProductById(product_id: string): Promise<Inventory | null> {
        const data = await inventoryDB.selectFrom(TABLES.INVENTORY).selectAll().where("product_id", "=", product_id).executeTakeFirst();
        if (!data) return null;
        return data;
    }

    async updateAvailableQuantity(product_id: string, quantityChange: number): Promise<Inventory | null> {
        const result = await inventoryDB
            .updateTable(TABLES.INVENTORY)
            .set({
                available_quantity: sql`available_quantity + ${quantityChange}`,
                updated_at: new Date()
            })
            .where('product_id', '=', product_id)
            .where(sql`available_quantity + ${quantityChange}`, '>=', 0) // Prevent negative quantity
            .returningAll()
            .executeTakeFirst();

        return result || null;
    }

    // Inventory Reservation

    async createInventoryReservation(inventory_reservations: NewInventoryReservation): Promise<InventoryReservation> {
        return await reservationInventoryDB.insertInto(TABLES.RESERVATION_INVENTORY).values(inventory_reservations).returningAll().executeTakeFirstOrThrow();
    }

    async removeQtyFromInventory(
        productId: string,
        qty: number
    ): Promise<any> {
        const query = `
    UPDATE inventory
    SET available_quantity = available_quantity - $1
    WHERE product_id = $2
      AND available_quantity >= $1
    RETURNING product_id, available_quantity, total_quantity;
  `;

        const { rows, rowCount } = await pgPool.query(query, [qty, productId]);

        if (rowCount === 0) {
            throw new Error('Insufficient inventory or invalid product_id');
        }

        return rows[0];
    }

    async releaseReservation(productId: string): Promise<void> {
        const client = await pgPool.connect();

        try {
            await client.query('BEGIN');

            await client.query(
                `
      UPDATE inventory i
      SET available_quantity = available_quantity + r.total_reserved
      FROM (
        SELECT product_id, SUM(quantity) AS total_reserved
        FROM inventory_reservations
        WHERE product_id = $1
        GROUP BY product_id
      ) r
      WHERE i.product_id = r.product_id;
      `,
                [productId]
            );

            await client.query(
                `
      DELETE FROM inventory_reservations
      WHERE product_id = $1;
      `,
                [productId]
            );

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getAllReservation(): Promise<InventoryReservation[]> {
        return await reservationInventoryDB.selectFrom(TABLES.RESERVATION_INVENTORY).selectAll().execute();
    }

    async findProductIdByOrderId(orderId: string): Promise<any> {
        return await itemOrderDB
            .selectFrom(TABLES.ORDERS_ITEMS)
            .select('product_id')
            .where("order_id", "=", orderId)
            .distinct()
            .execute();
    }

    async getOrderItemQuantity(order_id: string, product_id: string): Promise<{ quantity: number } | null> {
        const result = await itemOrderDB
            .selectFrom(TABLES.ORDERS_ITEMS)
            .select('quantity')
            .where('order_id', '=', order_id)
            .where('product_id', '=', product_id)
            .executeTakeFirst();

        return result ? { quantity: result.quantity } : null;
    }

}