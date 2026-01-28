import { container } from '../../../DI/container';
import { OrderRepository } from '../repositories/order.repository';
import type { Order } from '../repositories/order.repository';

export class OrderService {

  constructor(private readonly orderRepo: OrderRepository = new OrderRepository()) {}

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

}
