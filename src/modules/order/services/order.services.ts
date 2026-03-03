import { InventoryRepositories } from '../../inventory/repositories/inventory.repositories';
import { OrderRepository } from '../repositories/order.repository';
import type { Order } from '../repositories/order.repository';

export class OrderService {

  constructor(
    private readonly orderRepo: OrderRepository = new OrderRepository(),
    private readonly inventoryRepo: InventoryRepositories = new InventoryRepositories()
  ) { }

  async createOrder(input: {
    customer_id?: string;
    customerId?: string;
    status: 'PENDING' | 'PAID';
    total_amount?: number;
    totalAmount?: number;
  }) {
    const customerId = input.customerId || input.customer_id;
    const totalAmount = input.totalAmount || input.total_amount;

    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    if (totalAmount === undefined) {
      throw new Error("Total amount is required");
    }

    return this.orderRepo.create({
      customer_id: customerId,
      status: input.status,
      total_amount: totalAmount,
    });
  }

  async getOrderById(id: string): Promise<Order | null> {
    return await this.orderRepo.getById(id);
  }

  async getAllOrders(customer_id: string): Promise<Order[]> {
    return await this.orderRepo.getAll(customer_id);
  }

  async createOrderWithItems(input: {
    customer_id: string;
    items: Array<{
      product_id: string;
      quantity: number;
      amount: number;
      product_name: string;
      unit_price: number;
    }>;
  }) {
    const { customer_id } = input;

    if (!customer_id) {
      throw new Error("Customer ID is required");
    }
    if (!input.items || input.items.length === 0) {
      throw new Error("At least one item is required");
    }

    // Step 1: Check inventory availability for all items
    for (const item of input.items) {
      const inventory = await this.inventoryRepo.findProductById(item.product_id);

      if (!inventory) {
        throw new Error(`Product with ID ${item.product_id} is not available right now`);
      }

      if (inventory.available_quantity < item.quantity) {
        throw new Error(
          `Product ${inventory.name} is out of stock. Only ${inventory.available_quantity} units available, but you requested ${item.quantity}`
        );
      }
    }

    // Step 2: Calculate total and create the order
    const totalAmount = input.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

    const order = await this.orderRepo.create({
      customer_id,
      status: 'PENDING',
      total_amount: totalAmount,
    });

    // Step 3: Create order items
    const createdItems = [];
    for (const item of input.items) {
      const orderItem = await this.orderRepo.createOrdersItems({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        amount: item.amount,
        status: 'PENDING',
        product_name: item.product_name,
        unit_price: item.unit_price,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      createdItems.push(orderItem);
    }

    return {
      message: "Order created successfully with items",
      success: true,
      order: {
        id: order.id,
        customer_id: order.customer_id,
        status: order.status,
        total_amount: order.total_amount,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items: createdItems,
    };
  }

  async getAllOrdersCreated(customer_id: string): Promise<any[]> {
    const rawData = await this.orderRepo.getAllOrdersCreated(customer_id);

    const orderMap = new Map();

    for (const row of rawData) {
      const orderId = row.order_id;

      if (!orderMap.has(orderId)) {
        orderMap.set(orderId, {
          id: orderId,
          customer_id: row.customer_id,
          status: row.order_status,
          total_amount: row.total_amount,
          created_at: row.order_created_at,
          updated_at: row.updated_at,
          items: []
        });
      }

      const order = orderMap.get(orderId);
      order.items.push({
        id: row.item_id,
        order_id: row.order_id,
        product_id: row.product_id,
        quantity: row.quantity,
        status: row.item_status,
        expires_at: row.expires_at,
        created_at: row.item_created_at,
        rating: row.rating,
        review: row.review,
        reviewed_at: row.reviewed_at,
        amount: row.amount,
        product_name: row.product_name,
        brand_name: row.brand_name,
        bar_code: row.bar_code,
        image_url: row.image_url,
        inventory_price: row.inventory_price,
        batch_no: row.batch_no,
        mfg_date: row.mfg_date,
        inventory_expiry_date: row.inventory_expiry_date,
        inventory_total_quantity: row.inventory_total_quantity,
        inventory_available_quantity: row.inventory_available_quantity
      });
    }

    return Array.from(orderMap.values());
  }

  // ─── Shipment ────────────────────────────────────────────────────────────────

  async updateOrderShipment(order_id: string, shipmentData: {
    courier_name?: string;
    tracking_number?: string;
    shipped_at?: Date;
    delivered_at?: Date;
    shipment_status?: string; 
  }) {
    return await this.orderRepo.updateOrdersCouriers(order_id, shipmentData);
  }

  async updateOrderItemShipment(order_item_id: string, shipmentData: {
    shipment_status?: string;
    shipped_at?: Date;
    delivered_at?: Date;
    is_returned?: boolean;
    returned_at?: Date;
  }) {
    return await this.orderRepo.updateOrderItemsShipment(order_item_id, shipmentData);
  }

  async markOrderAsShipped(order_id: string, courierInfo: {
    courier_name: string;
    tracking_number: string;
  }) {
    return await this.updateOrderShipment(order_id, {
      courier_name: courierInfo.courier_name,
      tracking_number: courierInfo.tracking_number,
      shipped_at: new Date(),
      shipment_status: 'shipped',
    });
  }

  async markOrderAsDelivered(order_id: string) {
    return await this.updateOrderShipment(order_id, {
      delivered_at: new Date(),
      shipment_status: 'delivered',
    });
  }

  async markOrderItemAsReturned(order_item_id: string) {
    return await this.updateOrderItemShipment(order_item_id, {
      shipment_status: 'returned',
      is_returned: true,
      returned_at: new Date(),
    });
  }

  // ─── Payment ─────────────────────────────────────────────────────────────────

  async updateOrderPayment(order_id: string, paymentData: {
    order_number?: string;
    payment_status?: string;
    payment_method?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }) {
    return await this.orderRepo.updateOrdersPaymentDetail(order_id, paymentData);
  }

  // ─── Shipping Address ─────────────────────────────────────────────────────────

  async updateOrderShippingDetails(order_id: string, shippingData: {
    shipping_name?: string;
    shipping_phone?: string;
    shipping_address_line1?: string;
    shipping_address_line2?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_pincode?: string;
    shipping_country?: string;
  }) {
    return await this.orderRepo.updateOrdersShippingDetails(order_id, shippingData);
  }
}