import { PaymentsTable } from "../payments.schema";
import { PaymentsRepsitories } from "../repositories/payments.repositories";
import { PaymentModel } from "../types/payment.types";
import { RazorpayWebhookEvent, WebhookEvents } from "../types/webhook.types";
import crypto from 'crypto';
import { VerifyPaymentDTO } from "../types/verify.paymentdto";

export class PaymentsServices {
    constructor(private readonly paymentsRepositories: PaymentsRepsitories) { }

    async createPayment(input: PaymentModel) {
        await this.paymentsRepositories.updateOrderStatusByOrderId(input.order_id, "IN_PROGRESS");
        return await this.paymentsRepositories.createPayment({
            order_id: input.order_id,
            user_id: input.user_id,
            razorpay_order_id: input.razorpay_order_id || '',
            amount: input.amount,
            currency: "INR",
            status: input.status
        });
    }
    static async verifyPayment(data: VerifyPaymentDTO) {


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

    async getRazorpayByOrderId(order_id: string) {
        if (order_id == null) {
            return {
                messsage: "OrderId should not be empty",
            }
        }
    }

    verifyWebhookSignature(body: string, signature: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', "webhook_secret")
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