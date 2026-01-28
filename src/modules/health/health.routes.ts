import { Router } from 'express';
import { HealthController } from './health.controller';

export const healthRouter = Router();
const controller = new HealthController();

healthRouter.get('/', controller.get);
