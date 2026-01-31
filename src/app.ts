import express from 'express';

import { orderRouter,userRouter, inventoryRouter } from './modules/index';
import dotenv from 'dotenv';
import { InventoryCronService } from './cron/inventory-cron.service';

export function createApp() {
  dotenv.config();

  const app = express();

  app.use(express.json());

  app.use('/orders', orderRouter);
  app.use('/users',userRouter);
  app.use('/inventory',inventoryRouter);
  
  // Start inventory reservation cleanup cron job
  const inventoryCron = InventoryCronService.getInstance();
  inventoryCron.startCleanupCron();

  return app;
}
