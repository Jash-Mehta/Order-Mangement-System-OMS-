import type { Request, Response } from 'express';
import { OrderService } from '../services/order.services';
import { ResponseUtil } from '../../../utils/response.util';


export class OrderController {

  constructor(private orderService: OrderService) { }

  create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const order = await this.orderService.createOrder(payload);
      ResponseUtil.created(res, order, 'Order created successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to create order', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const order = await this.orderService.getOrderById(req.params.id);

      if (!order) {
        ResponseUtil.notFound(res, 'Order not found', `No order found with ID: ${req.params.id}`);
        return;
      }

      ResponseUtil.success(res, order, 'Order retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve order', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  createWithItems = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const { items } = req.body;
    const customerId = (req as any).user?.userId; 

        if (!customerId) {
            ResponseUtil.badRequest(res, 'Unauthorized');
            return;
        }

      if (!items || items.length === 0) {
        ResponseUtil.badRequest(res, 'At least one item is required');
        return;
      }
      const result = await this.orderService.createOrderWithItems(payload);
      ResponseUtil.created(res, result, 'Order with items created successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to create order with items', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  getAllOrdersWithItems = async (req: Request, res: Response) => {
    try {
    
      const customerId = (req as any).user?.id;
        const orders = await this.orderService.getAllOrdersCreated(customerId);
      if (!customerId) {
        ResponseUtil.badRequest(res, 'Unauthorized');
        return;
      }
      return ResponseUtil.success(res, orders, "Get All Order");
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve orders with items', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const customerId = req.query.customerId;
      if (!customerId || Array.isArray(customerId)) {
        ResponseUtil.badRequest(res, 'customerId query parameter is required and must be a single value');
        return;
      }
      const orders = await this.orderService.getAllOrders(String(customerId));
      ResponseUtil.success(res, orders, 'Customer orders retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve customer orders', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
