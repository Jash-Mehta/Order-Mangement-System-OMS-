export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id?: string;
        international: boolean;
        method: string;
        amount_refunded: number;
        refund_status?: string;
        captured: boolean;
        description: string;
        email: string;
        contact: string;
        notes: any[];
        fee: number;
        tax: number;
        error_code?: string;
        error_description?: string;
        created_at: number;
        bank_transaction?: any;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        status: string;
        notes: any[];
        created_at: number;
      };
    };
    payment_link?: any;
    refund?: {
      entity: {
        id: string;
        entity: string;
        amount: number;
        currency: string;
        payment_id: string;
        notes: any[];
        created_at: number;
      };
    };
  };
}

export interface WebhookHeaders {
  'x-razorpay-signature': string;
}

export enum WebhookEvents {
  PAYMENT_AUTHORIZED = 'payment.authorized',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_CAPTURED = 'payment.captured',
  PAYMENT_REFUNDED = 'payment.refunded',
  ORDER_PAID = 'order.paid',
}
