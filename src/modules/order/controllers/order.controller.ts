import type { Request, Response } from 'express';
import { OrderService } from '../services/order.service';


export class OrderController {
  
  constructor(private orderService: OrderService) {}

  create = async (req: Request, res: Response) => {
    const payload = req.body;

    const order = await this.orderService.createOrder(payload);
    res.status(201).json(order);
  };

  getById = async (req: Request, res: Response) => {
    const order = await this.orderService.getOrderById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json(order);
  };

  createWithItems = async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await this.orderService.createOrderWithItems(payload);
    res.status(201).json(result);
  };

  getAllOrdersWithItems = async (req: Request, res: Response) => {
    const orders = await this.orderService.getAllOrdersCreated();
    res.status(200).json(orders);
  };

  getAll = async(req: Request, res: Response) => {
    const customerId = req.query.customerId;
    if (!customerId || Array.isArray(customerId)) {
      res.status(400).json({ message: 'customerId query parameter is required' });
      return;
    }
    const orders = await this.orderService.getAllOrders(String(customerId));

    res.status(200).json(orders);
  }
}
