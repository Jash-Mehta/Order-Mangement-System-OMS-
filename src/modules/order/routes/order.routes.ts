import { Router } from 'express';
import { container } from '../../../DI/container';
export const orderRouter = Router();


orderRouter.post('/', container.orderController.create);
orderRouter.post('/with-items', container.orderController.createWithItems);
orderRouter.get('/get-items', container.orderController.getAllOrdersWithItems);
orderRouter.get('/', container.orderController.getAll);
orderRouter.get('/:id', container.orderController.getById);