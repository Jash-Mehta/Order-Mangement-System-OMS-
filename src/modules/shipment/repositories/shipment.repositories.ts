import { Insertable, Selectable } from 'kysely';
import { shipmentDB, orderDB, itemOrderDB } from '../../../database';
import { ShipmentsTable, ShipmentItemsTable, ShipmentTrackingTable, ShipmentStatus, ShipmentItemStatus } from '../schema/shipment.schema';
import { TABLES } from '../../../database/table_name';

export type Shipment = Selectable<ShipmentsTable>;
export type NewShipment = Insertable<ShipmentsTable>;

export type ShipmentItem = Selectable<ShipmentItemsTable>;
export type NewShipmentItem = Insertable<ShipmentItemsTable>;

export type ShipmentTracking = Selectable<ShipmentTrackingTable>;
export type NewShipmentTracking = Insertable<ShipmentTrackingTable>;

export class ShipmentRepository {

  // ─── Shipment ──────────────────────────────────────────────────────────────

  async create(data: NewShipment): Promise<Shipment> {
    return await shipmentDB
      .insertInto(TABLES.SHIPMENTS)
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getById(id: string): Promise<Shipment | null> {
    const row = await shipmentDB
      .selectFrom(TABLES.SHIPMENTS)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    return row ?? null;
  }

  async getByOrderId(order_id: string): Promise<Shipment | null> {
    const row = await shipmentDB
      .selectFrom(TABLES.SHIPMENTS)
      .selectAll()
      .where('order_id', '=', order_id)
      .executeTakeFirst();
    return row ?? null;
  }

  async getByCustomerId(customer_id: string): Promise<Shipment[]> {
    return await shipmentDB
      .selectFrom(TABLES.SHIPMENTS)
      .selectAll()
      .where('customer_id', '=', customer_id)
      .orderBy('created_at', 'desc')
      .execute();
  }

  async updateStatus(id: string, status: ShipmentStatus, timestamps: {
    dispatched_at?: Date;
    in_transit_at?: Date;
    out_for_delivery_at?: Date;
    delivered_at?: Date;
    returned_at?: Date;
    failed_at?: Date;
  } = {}): Promise<Shipment> {
    return await shipmentDB
      .updateTable(TABLES.SHIPMENTS)
      .set({
        status,
        ...timestamps,
        updated_at: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateCourierInfo(id: string, data: {
    courier_name?: string;
    tracking_number?: string;
    courier_order_id?: string;
    awb_number?: string;
    notes?: string;
  }): Promise<Shipment> {
    return await shipmentDB
      .updateTable(TABLES.SHIPMENTS)
      .set({ ...data, updated_at: new Date() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // ─── Shipment Items ────────────────────────────────────────────────────────

  async createItem(data: NewShipmentItem): Promise<ShipmentItem> {
    return await shipmentDB
      .insertInto(TABLES.SHIPMENT_ITEMS)
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getItemsByShipmentId(shipment_id: string): Promise<ShipmentItem[]> {
    return await shipmentDB
      .selectFrom(TABLES.SHIPMENT_ITEMS)
      .selectAll()
      .where('shipment_id', '=', shipment_id)
      .execute();
  }

  async updateItemStatus(item_id: string, status: ShipmentItemStatus, extra: {
    returned_at?: Date;
    return_reason?: string;
    damaged_at?: Date;
    damage_notes?: string;
  } = {}): Promise<ShipmentItem> {
    return await shipmentDB
      .updateTable(TABLES.SHIPMENT_ITEMS)
      .set({ status, ...extra, updated_at: new Date() })
      .where('id', '=', item_id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateAllItemsStatus(shipment_id: string, status: ShipmentItemStatus): Promise<void> {
    await shipmentDB
      .updateTable(TABLES.SHIPMENT_ITEMS)
      .set({ status, updated_at: new Date() })
      .where('shipment_id', '=', shipment_id)
      .execute();
  }

  // ─── Tracking ──────────────────────────────────────────────────────────────

  async addTrackingEvent(data: NewShipmentTracking): Promise<ShipmentTracking> {
    return await shipmentDB
      .insertInto(TABLES.SHIPMENT_TRACKING)
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getTrackingHistory(shipment_id: string): Promise<ShipmentTracking[]> {
    return await shipmentDB
      .selectFrom(TABLES.SHIPMENT_TRACKING)
      .selectAll()
      .where('shipment_id', '=', shipment_id)
      .orderBy('happened_at', 'asc')
      .execute();
  }

  // ─── Cross-table updates (order + order_items) ─────────────────────────────

  async updateOrderStatus(order_id: string, status: string): Promise<void> {
    await orderDB
      .updateTable(TABLES.ORDERS)
      .set({ status: status as any, updated_at: new Date() })
      .where('id', '=', order_id)
      .execute();
  }

  async updateOrderItemsStatus(order_id: string, status: string): Promise<void> {
    await itemOrderDB
      .updateTable(TABLES.ORDERS_ITEMS)
      .set({ status: status as any})
      .where('order_id', '=', order_id)
      .execute();
  }
}