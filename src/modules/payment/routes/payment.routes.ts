import { Router } from 'express';
import { container } from '../../../DI/container';
export const paymentsRouter = Router();

paymentsRouter.post('/',container.paymentsControllers.createPayment);