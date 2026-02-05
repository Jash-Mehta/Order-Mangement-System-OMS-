import { PaymentsTable } from "../payments.schema";
import { PaymentsRepsitories } from "../repositories/payments.repositories";
import { PaymentModel } from "../types/payment.types";
import crypto from 'crypto';
import { VerifyPaymentDTO } from "../types/verify.paymentdto";

export class PaymentsServices {
    constructor(private readonly paymentsRepositories: PaymentsRepsitories) { }

    async createPayment(input: PaymentModel) {
        return await this.paymentsRepositories.createPayment({
            order_id: input.order_id,
            customer_id: input.customer_id,
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