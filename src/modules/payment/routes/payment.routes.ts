import { Router, raw } from 'express';
import { container } from '../../../DI/container';
import { AuthMiddleware } from '../../../middleware/auth.middleware';

export const paymentsRouter = Router();

paymentsRouter.post('/', AuthMiddleware.authenticate, container.paymentsControllers.createPayment);

paymentsRouter.post('/webhook',
    raw({ type: 'application/json' }),  // raw imported directly from express
    container.paymentsControllers.handleWebhook
);

paymentsRouter.get('/order/:orderId', AuthMiddleware.authenticate, container.paymentsControllers.getPaymentByOrderId);
paymentsRouter.get('/razorpay/:razorpayPaymentId', AuthMiddleware.authenticate, container.paymentsControllers.getPaymentByRazorpayId);
paymentsRouter.get('/user/:userId', AuthMiddleware.authenticate, container.paymentsControllers.getUserPayments);
paymentsRouter.get('/refunds/:paymentId', AuthMiddleware.authenticate, container.paymentsControllers.getPaymentRefunds);

paymentsRouter.post('/verify', AuthMiddleware.authenticate, container.paymentsControllers.verifyPayment);