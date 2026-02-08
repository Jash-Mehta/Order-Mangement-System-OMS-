import { Router } from 'express';
import { container } from '../../../DI/container';
export const paymentsRouter = Router();
import express from "express";

const app = express();

paymentsRouter.post('/',container.paymentsControllers.createPayment);
paymentsRouter.post('/webhook', 
    express.raw({ type: 'application/json' }), 
    container.paymentsControllers.handleWebhook
);
