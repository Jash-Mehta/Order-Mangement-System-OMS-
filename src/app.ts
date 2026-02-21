import express from 'express';
import { orderRouter, userRouter, inventoryRouter, paymentsRouter } from './modules/index';
import dotenv from 'dotenv';
import { InventoryCronService } from './cron/inventory-cron.service';
import { ErrorHandler, LoggerMiddleware } from './middleware';
import { defaultCors, devCors } from './middleware/cors.middleware';

export function createApp() {
  dotenv.config();

  const app = express();

  // Request logging middleware
  app.use(LoggerMiddleware.requestLogger);

  // CORS middleware - use devCors for development, defaultCors for production
  const corsMiddleware = process.env.NODE_ENV === 'production' ? defaultCors : devCors;
  app.use(corsMiddleware);

  // Body parsing middleware
  app.use(express.json()); 
  app.use(express.urlencoded({ extended: true }));

  // Route registration
  app.use('/orders', orderRouter);
  app.use('/users', userRouter);
  app.use('/inventory', inventoryRouter);
  app.use('/payments', paymentsRouter);
  
  // Health check route (before error handler)
  app.use('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use(ErrorHandler.handleNotFound);

  // Global error handler
  app.use(ErrorHandler.handleGlobalError);

  // Start inventory reservation cleanup cron job
  const inventoryCron = InventoryCronService.getInstance();
  inventoryCron.startCleanupCron();

  return app;
}
