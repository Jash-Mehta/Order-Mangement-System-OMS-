const {Router} = require('express');
import { container } from '../../../DI/container';
export const inventoryRouter = Router();

inventoryRouter.post('/',container.inventoryControllers.createInventory);
inventoryRouter.get('/:id', container.inventoryControllers.findProductId);

