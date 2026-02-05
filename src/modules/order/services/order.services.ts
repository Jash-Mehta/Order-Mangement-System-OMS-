import { container } from '../../../DI/container';
import { InventoryRepositories } from '../../inventory/repositories/inventory.repositories';
import { OrderRepository } from '../repositories/order.repository';
import type { Order } from '../repositories/order.repository';

export class OrderService {

  constructor(private readonly orderRepo: OrderRepository = new OrderRepository(),
   private readonly inventoryRepo: InventoryRepositories = new InventoryRepositories()) {}

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
    customer_id?: string;
    customerId?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      amount: number;
    }>;
  }) {
    console.log('Creating order with items:', input);
    
    const customerId = input.customerId || input.customer_id;
    
    if (!customerId) {
      return ("Customer ID is required");
    }
    
    if (!input.items || input.items.length === 0) {
      return ("At least one item is required");
    }
    
    // Step 1: Check inventory availability for all items
    for (const item of input.items) {
      const inventory = await this.inventoryRepo.findProductById(item.product_id);
      
      if (!inventory) {
        return (`Product with ID ${item.product_id} is not available right now`);
      }
      
      if (inventory.available_quantity < item.quantity) {
        return (`Product ${inventory.name} is out of stock. Only ${inventory.available_quantity} units available, but you requested ${item.quantity}`);
      }
    }
    
    const totalAmount = input.items.reduce((sum, item) => sum + (item.amount * item.quantity), 0);
    
    // Step 2: Create the order with calculated total amount
    const order = await this.orderRepo.create({
      customer_id: customerId,
      status: 'PENDING',
      total_amount: totalAmount,
    });
    
    console.log('Created order:', order);
    
    // Step 3: Create order items and update inventory
    const createdItems = [];
    for (const item of input.items) {
      const inventory = await this.inventoryRepo.findProductById(item.product_id);
      
      // Create order item
      const orderItem = await this.orderRepo.createOrdersItems({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        amount: item.amount,
        status: 'PENDING',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      createdItems.push(orderItem);
      
      // TODO: Update inventory available_quantity (you'll need to add this method to inventory repo)
      console.log(`Would update inventory for product ${item.product_id}, reducing quantity by ${item.quantity}`);
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

  async getAllOrdersCreated(): Promise<any[]> {
    const rawData = await this.orderRepo.getAllOrdersCreated();
    
    // Group data by order
    const orderMap = new Map();
    
    for (const row of rawData) {
      const orderId = row.order_id;
      
      // Create order if not exists
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
      
      // Add item to order
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
        // Inventory data
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

}
