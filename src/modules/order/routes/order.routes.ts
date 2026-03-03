import { Router } from 'express';
import { container } from '../../../DI/container';
import { AuthMiddleware } from '../../../middleware/auth.middleware';

export const orderRouter = Router();

const auth = AuthMiddleware.authenticate;

// ─── Orders ───────────────────────────────────────────────────────────────────
orderRouter.post('/',            auth, container.orderController.create);
orderRouter.post('/with-items',  auth, container.orderController.createWithItems);
orderRouter.get('/get-items',    auth, container.orderController.getAllOrdersWithItems);
orderRouter.get('/',             auth, container.orderController.getAll);
orderRouter.get('/:id',          auth, container.orderController.getById);

// ─── Shipment ─────────────────────────────────────────────────────────────────
orderRouter.patch('/:order_id/ship',     auth, container.orderController.markAsShipped);
orderRouter.patch('/:order_id/deliver',  auth, container.orderController.markAsDelivered);
orderRouter.patch('/:order_id/shipment', auth, container.orderController.updateShipment);

// ─── Order Items ──────────────────────────────────────────────────────────────
orderRouter.patch('/items/:order_item_id/return',   auth, container.orderController.markItemAsReturned);
orderRouter.patch('/items/:order_item_id/shipment', auth, container.orderController.updateItemShipment);

// ─── Payment ──────────────────────────────────────────────────────────────────
orderRouter.patch('/:order_id/payment', auth, container.orderController.updatePayment);

// ─── Shipping Address ─────────────────────────────────────────────────────────
orderRouter.patch('/:order_id/shipping-details', auth, container.orderController.updateShippingDetails);