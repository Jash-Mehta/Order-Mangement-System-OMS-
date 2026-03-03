import { Insertable, Selectable } from 'kysely';
import { orderDB, itemOrderDB, pgPool } from '../../../database';
import { ItemOrderTable, OrdersTable } from '../schema/orders.schema';
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

    return row ?? null;
  }

  async getAll(customer_id: string): Promise<Order[]> {
    return await orderDB
      .selectFrom('orders')
      .selectAll()
      .where('customer_id', '=', customer_id)
      .execute();
  }

  async createOrdersItems(itemsOrders: NewItemsOrders): Promise<ItemsOrders> {
    return await itemOrderDB
      .insertInto(TABLES.ORDERS_ITEMS)
      .values(itemsOrders)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getAllOrdersCreated(customer_id: string): Promise<any[]> {
    const query = `
      SELECT
        oi.id            AS item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.amount,
        oi.status        AS item_status,
        oi.expires_at,
        oi.created_at    AS item_created_at,
        oi.rating,
        oi.review,
        oi.reviewed_at,
        o.id             AS order_id,
        o.customer_id,
        o.status         AS order_status,
        o.total_amount,
        o.created_at     AS order_created_at,
        o.updated_at,
        i.product_id     AS inventory_product_id,
        i.name           AS product_name,
        i.brand_name,
        i.bar_code,
        i.image_url,
        i.price          AS inventory_price,
        i.batch_no,
        i.mfg_date,
        i.expiry_date    AS inventory_expiry_date,
        i.total_quantity AS inventory_total_quantity,
        i.available_quantity AS inventory_available_quantity
      FROM orders_items oi
      INNER JOIN orders o ON o.id = oi.order_id
      LEFT  JOIN inventory i ON i.product_id = oi.product_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC, oi.created_at ASC
    `;
    const { rows } = await pgPool.query(query, [customer_id]);
    return rows;
  }

  // ─── Orders table updates ──────────────────────────────────────────────────

  async updateOrdersCouriers(order_id: string, shipmentData: {
    courier_name?: string;
    tracking_number?: string;
    shipped_at?: Date;
    delivered_at?: Date;
    shipment_status?: string;  
  }): Promise<any> {
    return await orderDB
      .updateTable(TABLES.ORDERS)
      .set({
        ...(shipmentData.courier_name    && { courier_name:    shipmentData.courier_name }),
        ...(shipmentData.tracking_number && { tracking_number: shipmentData.tracking_number }),
        ...(shipmentData.shipped_at      && { shipped_at:      shipmentData.shipped_at }),
        ...(shipmentData.delivered_at    && { delivered_at:    shipmentData.delivered_at }),
        ...(shipmentData.shipment_status && { shipment_status: shipmentData.shipment_status }),  // FIX
        updated_at: new Date(),
      })
      .where('id', '=', order_id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateOrdersPaymentDetail(order_id: string, paymentData: {
    order_number?: string;
    payment_status?: string;
    payment_method?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }): Promise<any> {
    return await orderDB
      .updateTable(TABLES.ORDERS)
      .set({
        ...(paymentData.order_number        && { order_number:        paymentData.order_number }),
        ...(paymentData.payment_status      && { payment_status:      paymentData.payment_status }),
        ...(paymentData.payment_method      && { payment_method:      paymentData.payment_method }),
        ...(paymentData.razorpay_order_id   && { razorpay_order_id:   paymentData.razorpay_order_id }),
        ...(paymentData.razorpay_payment_id && { razorpay_payment_id: paymentData.razorpay_payment_id }),
        ...(paymentData.razorpay_signature  && { razorpay_signature:  paymentData.razorpay_signature }),
        updated_at: new Date(),
      })
      .where('id', '=', order_id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateOrdersShippingDetails(order_id: string, shippingData: {
    shipping_name?: string;
    shipping_phone?: string;
    shipping_address_line1?: string;
    shipping_address_line2?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_pincode?: string;
    shipping_country?: string;
  }): Promise<any> {
    return await orderDB
      .updateTable(TABLES.ORDERS)
      .set({
        ...(shippingData.shipping_name          && { shipping_name:          shippingData.shipping_name }),
        ...(shippingData.shipping_phone         && { shipping_phone:         shippingData.shipping_phone }),
        ...(shippingData.shipping_address_line1 && { shipping_address_line1: shippingData.shipping_address_line1 }),
        ...(shippingData.shipping_address_line2 && { shipping_address_line2: shippingData.shipping_address_line2 }),
        ...(shippingData.shipping_city          && { shipping_city:          shippingData.shipping_city }),
        ...(shippingData.shipping_state         && { shipping_state:         shippingData.shipping_state }),
        ...(shippingData.shipping_pincode       && { shipping_pincode:       shippingData.shipping_pincode }),
        ...(shippingData.shipping_country       && { shipping_country:       shippingData.shipping_country }),
        updated_at: new Date(),
      })
      .where('id', '=', order_id)
      .returningAll()
      .executeTakeFirst();
  }

  // ─── Order items table updates ──────────────────────────────────────────────

  async updateOrderItemsShipment(order_item_id: string, shipmentData: {
    shipment_status?: string;
    shipped_at?: Date;
    delivered_at?: Date;
    is_returned?: boolean;
    returned_at?: Date;
  }): Promise<any> {
    return await itemOrderDB
      .updateTable(TABLES.ORDERS_ITEMS)
      .set({
        ...(shipmentData.shipment_status              && { shipment_status: shipmentData.shipment_status }),
        ...(shipmentData.shipped_at                   && { shipped_at:      shipmentData.shipped_at }),
        ...(shipmentData.delivered_at                 && { delivered_at:    shipmentData.delivered_at }),
        ...(shipmentData.is_returned !== undefined     && { is_returned:     shipmentData.is_returned }),
        ...(shipmentData.returned_at                  && { returned_at:     shipmentData.returned_at }),
        
      })
      .where('id', '=', order_item_id)
      .returningAll()
      .executeTakeFirst();
  }
}