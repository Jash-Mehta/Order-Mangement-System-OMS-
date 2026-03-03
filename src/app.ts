import express from 'express';
import { orderRouter, userRouter, inventoryRouter, paymentsRouter, shipmentRouter } from './modules/index';
import dotenv from 'dotenv';
import { InventoryCronService } from './cron/inventory-cron.service';
import { ErrorHandler, LoggerMiddleware } from './middleware';
import { defaultCors, devCors } from './middleware/cors.middleware';

export function createApp() {
    dotenv.config();
    const app = express();
    app.use(LoggerMiddleware.requestLogger);

    const corsMiddleware = process.env.NODE_ENV === 'production' ? defaultCors : devCors;
    app.use(corsMiddleware);

    app.use((req, res, next) => {
        if (req.originalUrl === '/api/payments/webhook') {
            next();
        } else {
            express.json()(req, res, next);
        }
    });
    app.use(express.urlencoded({ extended: true }));

    // Route registration
    app.use('/orders', orderRouter);
    app.use('/users', userRouter);
    app.use('/inventory', inventoryRouter);
    app.use('/api/payments', paymentsRouter);
    app.use('/api/shipment', shipmentRouter);

    
    app.use('/health', (req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    
    app.use(ErrorHandler.handleNotFound);

    
    app.use(ErrorHandler.handleGlobalError);

    
    const inventoryCron = InventoryCronService.getInstance();
    inventoryCron.startCleanupCron();

    return app;
}