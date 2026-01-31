const {Router} = require('express');
import { container } from '../../../DI/container';
export const inventoryRouter = Router();

inventoryRouter.post('/',container.inventoryControllers.createInventory);
inventoryRouter.get('/reservations/all', container.inventoryControllers.getAllReservation);
inventoryRouter.post('/reservation', container.inventoryControllers.createInventoryReservation);
inventoryRouter.post('/reservation/order', container.inventoryControllers.createReservationsForOrder);
//inventoryRouter.post('/cleanup', container.inventoryControllers.cleanupExpiredReservations);
inventoryRouter.get('/:id', container.inventoryControllers.findProductId);
