import { container } from '../../../DI/container';
import { OrderRepository } from '../repositories/order.repository';
import type { Order } from '../repositories/order.repository';

export class OrderService {

  constructor(private readonly orderRepo: OrderRepository = new OrderRepository()) {}

  async createOrder(input: {
    customerId: number;
    status: 'PENDING' | 'PAID';
    totalAmount: number;
  }) {
    if(!input.customerId){
      throw new Error("User Id Should not be Empty");
    }
    return this.orderRepo.create({
      customer_id: input.customerId,
      status: input.status,
      total_amount: input.totalAmount,
    });
  }

  async getOrderById(id: string): Promise<Order | null> {
    const orderId = Number(id);
    if (Number.isNaN(orderId)) {
      throw new Error('Invalid order id');
    }

    return await this.orderRepo.getById(orderId);
  }

  async getAllOrders(customer_id: number): Promise<Order[]> {
    return await this.orderRepo.getAll(customer_id);
  }

}
