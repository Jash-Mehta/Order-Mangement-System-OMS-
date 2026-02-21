import { Generated } from 'kysely';

export interface RefundsTable {
  id: Generated<string>;

  payment_id: string;

  razorpay_refund_id?: string;

  amount: number;

  status:
    | 'PENDING'
    | 'PROCESSED'
    | 'FAILED';

  created_at: Generated<Date>;
}

export interface RefundDatabase {
  refunds: RefundsTable;
}
