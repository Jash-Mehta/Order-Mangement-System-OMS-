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

            const isValid = this.paymentServices.verifyWebhookSignature(
                JSON.stringify(body),
                signature
            );

            if (!isValid) {
                ResponseUtil.unauthorized(res, 'Invalid webhook signature', 'Webhook signature verification failed');
                return;
            }

            await this.paymentServices.processWebhook(body as RazorpayWebhookEvent);
            ResponseUtil.success(res, { received: true }, 'Webhook processed successfully');
        } catch (error) {
            console.error('Webhook processing error:', error);
            ResponseUtil.internalError(res, 'Webhook processing failed', error instanceof Error ? error.message : 'Unknown error');
        }
    }

}