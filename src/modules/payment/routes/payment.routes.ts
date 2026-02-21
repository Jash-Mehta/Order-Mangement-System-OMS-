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

// NEW: Payment retrieval endpoints
paymentsRouter.get('/order/:orderId', container.paymentsControllers.getPaymentByOrderId);
paymentsRouter.get('/razorpay/:razorpayPaymentId', container.paymentsControllers.getPaymentByRazorpayId);
paymentsRouter.get('/user/:userId', container.paymentsControllers.getUserPayments);
paymentsRouter.get('/refunds/:paymentId', container.paymentsControllers.getPaymentRefunds);

// NEW: Payment verification endpoint
paymentsRouter.post('/verify', container.paymentsControllers.verifyPayment);
