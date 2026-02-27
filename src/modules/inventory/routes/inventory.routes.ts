import { Router } from 'express';
import { container } from '../../../DI/container';
import { AuthMiddleware } from '../../../middleware/auth.middleware';
export const inventoryRouter = Router();

inventoryRouter.post('/',AuthMiddleware.authenticate ,container.inventoryControllers.createInventory);
inventoryRouter.get('/', AuthMiddleware.authenticate ,container.inventoryControllers.getAllInventoryProduct);
inventoryRouter.get('/reservations/all', AuthMiddleware.authenticate ,container.inventoryControllers.getAllReservation);
inventoryRouter.post('/reservation', AuthMiddleware.authenticate ,container.inventoryControllers.createInventoryReservation);
inventoryRouter.post('/reservation/order', AuthMiddleware.authenticate ,container.inventoryControllers.createReservationsForOrder);
//inventoryRouter.post('/cleanup', container.inventoryControllers.cleanupExpiredReservations);
inventoryRouter.get('/:id', AuthMiddleware.authenticate ,container.inventoryControllers.findProductId);
