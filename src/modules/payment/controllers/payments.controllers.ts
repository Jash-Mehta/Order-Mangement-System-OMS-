import { Request, Response } from "express";
import { PaymentsServices } from "../services/payments.services";
import { RazorpayWebhookEvent } from "../types/webhook.types";

export class PaymentsControllers {
    constructor(private paymentServices: PaymentsServices) { }
    createPayment = async (req: Request, res: Response) => {
        const data = await this.paymentServices.createPayment(req.body);
        return res.status(200).json(data);
    }

    handleWebhook = async (req: Request, res: Response) => {
        try {
            const signature = req.headers['x-razorpay-signature'] as string;
            const body = req.body;

            if (!signature) {
                return res.status(400).json({ error: 'Missing webhook signature' });
            }

            const isValid = this.paymentServices.verifyWebhookSignature(
                JSON.stringify(body),
                signature
            );

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }

            await this.paymentServices.processWebhook(body as RazorpayWebhookEvent);

            return res.status(200).json({ received: true });
        } catch (error) {
            console.error('Webhook processing error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

}