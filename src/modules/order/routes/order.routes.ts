import { Router } from 'express';
import { container } from '../../../DI/container';
export const orderRouter = Router();
import { AuthMiddleware } from '../../../middleware/auth.middleware';

orderRouter.post('/',AuthMiddleware.authenticate ,container.orderController.create);
orderRouter.post('/with-items',AuthMiddleware.authenticate  ,container.orderController.createWithItems);
orderRouter.get('/get-items', AuthMiddleware.authenticate ,container.orderController.getAllOrdersWithItems);
orderRouter.get('/',AuthMiddleware.authenticate , container.orderController.getAll);
orderRouter.get('/:id',AuthMiddleware.authenticate , container.orderController.getById);