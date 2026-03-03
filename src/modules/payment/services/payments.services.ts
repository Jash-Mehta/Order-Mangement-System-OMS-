import { PaymentsRepsitories } from "../repositories/payments.repositories";
import { PaymentModel } from "../types/payment.types";
import { RazorpayWebhookEvent, WebhookEvents } from "../types/webhook.types";
import crypto from 'crypto';
import { VerifyPaymentDTO } from "../types/verify.paymentdto";
import { InventoryServices } from "../../inventory/services/inventory.services";
import Razorpay from "razorpay";

export class PaymentsServices {
     private readonly razorpay: Razorpay;
    constructor(
        private readonly paymentsRepositories: PaymentsRepsitories,
        private readonly reservationServices: InventoryServices,
    ) { 
           this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });
    }

    async createPayment(input: PaymentModel) {
        const { order_id, user_id } = input;

        // Step 1: Check duplicate FIRST before doing anything
        const existing = await this.paymentsRepositories.getRazorpayByOrderId(input.order_id);
        if (existing) {
            return {
                message: 'Payment already initiated for this order. Please wait or contact support.',
            };
        }

        // Step 2: Update order status
        await this.paymentsRepositories.updateOrderStatusByOrderId(input.order_id, "IN_PROGRESS");
       

        // Create order on Razorpay
        const razorpayOrder = await this.razorpay.orders.create({
            amount: input.amount,   // in paise
            currency: 'INR',
            receipt: input.order_id,
        });
        // Step 3: Deduct stock from inventory — only happens when user clicks pay
        await this.reservationServices.createReservationsForOrder({ order_id, user_id });

        // Then save razorpay_order_id to your DB
        return await this.paymentsRepositories.createPayment({
            order_id: input.order_id,
            user_id: input.user_id,
            razorpay_order_id: razorpayOrder.id,  // from Razorpay
            amount: input.amount,
            currency: "INR",
            status: input.status
        });


    }

    async verifyPayment(data: VerifyPaymentDTO) {
        const isValid = verifyRazorpaySignature(
            data.razorpayOrderId,
            data.razorpayPaymentId,
            data.razorpaySignature
        );

        if (!isValid) {
            throw new Error('Invalid Razorpay signature');
        }

        return { success: true };
    }

    async getPaymentByOrderId(order_id: string) {
        return await this.paymentsRepositories.getRazorpayByOrderId(order_id);
    }

    async getPaymentByRazorpayId(razorpay_payment_id: string) {
        return await this.paymentsRepositories.getPaymentByRazorpayId(razorpay_payment_id);
    }

    async getUserPayments(user_id: string) {
        return await this.paymentsRepositories.getUserPayments(user_id);
    }

    async getPaymentRefunds(payment_id: string) {
        return await this.paymentsRepositories.getPaymentRefunds(payment_id);
    }

    verifyWebhookSignature(body: string, signature: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    }

    async processWebhook(event: RazorpayWebhookEvent): Promise<void> {
        const { event: eventType, payload } = event;

        switch (eventType) {
            case WebhookEvents.PAYMENT_AUTHORIZED:
                await this.handlePaymentAuthorized(payload.payment.entity);
                break;

            case WebhookEvents.PAYMENT_CAPTURED:
                await this.handlePaymentCaptured(payload.payment.entity);
                break;

            case WebhookEvents.PAYMENT_FAILED:
                await this.handlePaymentFailed(payload.payment.entity);
                await this.paymentsRepositories.updateOrderStatusByOrderId(event.payload.payment.entity.order_id, "FAILED");
                break;

            case WebhookEvents.PAYMENT_REFUNDED:
                if (payload.refund) {
                    await this.handlePaymentRefunded(payload.refund.entity);
                    await this.paymentsRepositories.updateOrderStatusByOrderId(event.payload.payment.entity.order_id, "REFUNDED");
                }
                break;

            case WebhookEvents.ORDER_PAID:
                if (payload.order) {
                    await this.handleOrderPaid(payload.order.entity);
                    await this.paymentsRepositories.updateOrderStatusByOrderId(event.payload.payment.entity.order_id, "PAID");
                }
                break;

            default:
                console.log(`Unhandled webhook event: ${eventType}`);
        }
    }

    private async handlePaymentAuthorized(paymentEntity: any): Promise<void> {
        await this.paymentsRepositories.updatePaymentStatus(
            paymentEntity.order_id,
            'AUTHORIZED'
        );
    }

    private async handlePaymentCaptured(paymentEntity: any): Promise<void> {
        await this.paymentsRepositories.updatePaymentStatus(
            paymentEntity.order_id,
            'CAPTURED'
        );
    }

    private async handlePaymentFailed(paymentEntity: any): Promise<void> {
        await this.paymentsRepositories.updatePaymentStatus(
            paymentEntity.order_id,
            'FAILED'
        );
    }

    private async handlePaymentRefunded(refundEntity: any): Promise<void> {
        await this.paymentsRepositories.updatePaymentStatusByPaymentId(
            refundEntity.payment_id,
            'REFUNDED'
        );
    }

    private async handleOrderPaid(orderEntity: any): Promise<void> {
        await this.paymentsRepositories.updatePaymentStatus(
            orderEntity.id,
            'CAPTURED'
        );
    }
}

function verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string
) {
    const body = `${orderId}|${paymentId}`;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body)
        .digest('hex');

    return expectedSignature === signature;
}