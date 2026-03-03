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
  };

  // ─── Orders with Items ───────────────────────────────────────────────────────

  createWithItems = async (req: Request, res: Response) => {
    try {
      const customerId = (req as any).user?.userId;

      if (!customerId) {
        ResponseUtil.badRequest(res, 'Unauthorized');
        return;
      }

      const { items } = req.body;

      if (!items || items.length === 0) {
        ResponseUtil.badRequest(res, 'At least one item is required');
        return;
      }

      const result = await this.orderService.createOrderWithItems({
        customer_id: customerId,
        items,
      });

      ResponseUtil.created(res, result, 'Order with items created successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to create order with items', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  getAllOrdersWithItems = async (req: Request, res: Response) => {
    try {
      // FIX: auth check moved before service call
      const customerId = (req as any).user?.userId;

      if (!customerId) {
        ResponseUtil.badRequest(res, 'Unauthorized');
        return;
      }

      const orders = await this.orderService.getAllOrdersCreated(customerId);
      ResponseUtil.success(res, orders, 'Orders retrieved successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to retrieve orders with items', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ─── Shipment ────────────────────────────────────────────────────────────────

  markAsShipped = async (req: Request, res: Response) => {
    try {
      const { order_id } = req.params;
      const { courier_name, tracking_number } = req.body;

      if (!courier_name || !tracking_number) {
        ResponseUtil.badRequest(res, 'courier_name and tracking_number are required');
        return;
      }

      const result = await this.orderService.markOrderAsShipped(order_id, {
        courier_name,
        tracking_number,
      });

      ResponseUtil.success(res, result, 'Order marked as shipped');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to mark order as shipped', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markAsDelivered = async (req: Request, res: Response) => {
    try {
      const { order_id } = req.params;
      const result = await this.orderService.markOrderAsDelivered(order_id);
      ResponseUtil.success(res, result, 'Order marked as delivered');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to mark order as delivered', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  markItemAsReturned = async (req: Request, res: Response) => {
    try {
      const { order_item_id } = req.params;
      const result = await this.orderService.markOrderItemAsReturned(order_item_id);
      ResponseUtil.success(res, result, 'Order item marked as returned');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to mark order item as returned', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  updateShipment = async (req: Request, res: Response) => {
    try {
      const { order_id } = req.params;
      const result = await this.orderService.updateOrderShipment(order_id, req.body);
      ResponseUtil.success(res, result, 'Order shipment updated successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update order shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  updateItemShipment = async (req: Request, res: Response) => {
    try {
      const { order_item_id } = req.params;
      const result = await this.orderService.updateOrderItemShipment(order_item_id, req.body);
      ResponseUtil.success(res, result, 'Order item shipment updated successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update order item shipment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ─── Payment ─────────────────────────────────────────────────────────────────

  updatePayment = async (req: Request, res: Response) => {
    try {
      const { order_id } = req.params;
      const result = await this.orderService.updateOrderPayment(order_id, req.body);
      ResponseUtil.success(res, result, 'Order payment updated successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update order payment', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // ─── Shipping Address ─────────────────────────────────────────────────────────

  updateShippingDetails = async (req: Request, res: Response) => {
    try {
      const { order_id } = req.params;
      const result = await this.orderService.updateOrderShippingDetails(order_id, req.body);
      ResponseUtil.success(res, result, 'Shipping details updated successfully');
    } catch (error) {
      ResponseUtil.internalError(res, 'Failed to update shipping details', error instanceof Error ? error.message : 'Unknown error');
    }
  };
}