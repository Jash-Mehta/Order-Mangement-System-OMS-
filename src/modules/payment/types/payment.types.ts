export interface PaymentModel{
    id: string;
    order_id: string;
    customer_id: string;
    // Razorpay identifiers
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    amount: number;
    currency: 'INR';
    status:
    | 'CREATED'
    | 'AUTHORIZED'
    | 'CAPTURED'
    | 'FAILED'
    | 'REFUNDED';
    failure_reason?: string;
    created_at: Date;
    updated_at: Date;
}