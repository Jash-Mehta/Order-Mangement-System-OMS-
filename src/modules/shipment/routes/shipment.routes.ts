import { Router } from 'express';
import { container } from '../../../DI/container';
import { AuthMiddleware } from '../../../middleware/auth.middleware';

export const shipmentRouter = Router();

const auth = AuthMiddleware.authenticate;


shipmentRouter.get('/me',               auth, container.shipmentController.getMyShipments);
shipmentRouter.get('/order/:orderId',   auth, container.shipmentController.getShipmentByOrderId);
shipmentRouter.get('/:id',              auth, container.shipmentController.getShipmentById);
shipmentRouter.get('/:id/items',        auth, container.shipmentController.getShipmentItems);
shipmentRouter.get('/:id/tracking',     auth, container.shipmentController.getTrackingHistory);


shipmentRouter.post('/',                            container.shipmentController.createShipment);
shipmentRouter.patch('/:id/dispatch',               container.shipmentController.dispatchShipment);
shipmentRouter.patch('/:id/in-transit',             container.shipmentController.markInTransit);
shipmentRouter.patch('/:id/out-for-delivery',       container.shipmentController.markOutForDelivery);
shipmentRouter.patch('/:id/deliver',                container.shipmentController.markDelivered);
shipmentRouter.patch('/:id/fail',                   container.shipmentController.markFailed);
shipmentRouter.patch('/:id/return',                 container.shipmentController.markReturned);
shipmentRouter.post('/:id/tracking',                container.shipmentController.addTrackingEvent);
shipmentRouter.patch('/:id/items/:itemId/return',   container.shipmentController.returnItem);
shipmentRouter.patch('/:id/items/:itemId/damage',   container.shipmentController.markItemDamaged);