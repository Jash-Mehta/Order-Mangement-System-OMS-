import { Generated } from 'kysely';

export interface PaymentsTable {
  id: Generated<string>;

  order_id: string;
  customer_id: string;

  // Razorpay identifiers
  razorpay_order_id: string;
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

  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export interface PaymentDatabase {
  payments: PaymentsTable;
}
