import { Request, Response } from "express";
import { PaymentsServices } from "../services/payments.services";
import { RazorpayWebhookEvent } from "../types/webhook.types";
import { ResponseUtil } from "../../../utils/response.util";

export class PaymentsControllers {
    constructor(private paymentServices: PaymentsServices) { }

    createPayment = async (req: Request, res: Response) => {
        try {
            const data = await this.paymentServices.createPayment(req.body);
            ResponseUtil.success(res, data, 'Payment created successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to create payment', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    handleWebhook = async (req: Request, res: Response) => {
        try {
            const signature = req.headers['x-razorpay-signature'] as string;
            const body = req.body;

            if (!signature) {
                ResponseUtil.badRequest(res, 'Missing webhook signature', 'x-razorpay-signature header is required');
                return;
            }

            const rawBody = req.body instanceof Buffer
                ? req.body.toString('utf8')
                : JSON.stringify(req.body);

            const isValid = this.paymentServices.verifyWebhookSignature(
                rawBody,
                signature
            );

            if (!isValid) {
                ResponseUtil.badRequest(res, 'Invalid webhook signature', 'Webhook signature verification failed');
                return;
            }

            await this.paymentServices.processWebhook(body as RazorpayWebhookEvent);
            ResponseUtil.success(res, { received: true }, 'Webhook processed successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to process webhook', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    getPaymentByOrderId = async (req: Request, res: Response) => {
        try {
            const { orderId } = req.params;
            const payment = await this.paymentServices.getPaymentByOrderId(orderId);

            if (!payment) {
                ResponseUtil.notFound(res, 'Payment not found', `No payment found for order ID: ${orderId}`);
                return;
            }

            ResponseUtil.success(res, payment, 'Payment retrieved successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to retrieve payment', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    getPaymentByRazorpayId = async (req: Request, res: Response) => {
        try {
            const { razorpayPaymentId } = req.params;
            const payment = await this.paymentServices.getPaymentByRazorpayId(razorpayPaymentId);

            if (!payment) {
                ResponseUtil.notFound(res, 'Payment not found', `No payment found with Razorpay ID: ${razorpayPaymentId}`);
                return;
            }

            ResponseUtil.success(res, payment, 'Payment retrieved successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to retrieve payment', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    getUserPayments = async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                ResponseUtil.badRequest(res, 'Unauthorized', 'User not authenticated');
                return;
            }

            const payments = await this.paymentServices.getUserPayments(userId);
            ResponseUtil.success(res, payments, 'User payments retrieved successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to retrieve user payments', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    verifyPayment = async (req: Request, res: Response) => {
        try {
            const result = await this.paymentServices.verifyPayment(req.body);
            ResponseUtil.success(res, result, 'Payment verification completed');
        } catch (error) {
            ResponseUtil.internalError(res, 'Payment verification failed', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    getPaymentRefunds = async (req: Request, res: Response) => {
        try {
            const { paymentId } = req.params;
            const refunds = await this.paymentServices.getPaymentRefunds(paymentId);
            ResponseUtil.success(res, refunds, 'Payment refunds retrieved successfully');
        } catch (error) {
            ResponseUtil.internalError(res, 'Failed to retrieve refunds', error instanceof Error ? error.message : 'Unknown error');
        }
    }
}