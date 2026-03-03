import { Insertable, Selectable } from "kysely";
import { PaymentsTable } from "../schema/payments.schema";
import { refundsDB, paymentDB, itemOrderDB, orderDB } from "../../../database/index";
import { TABLES } from "../../../database/table_name";

export type Payment = Selectable<PaymentsTable>;
export type NewPayment = Insertable<PaymentsTable>;

export class PaymentsRepsitories {

  async createPayment(payments: NewPayment): Promise<Payment> {
    return await paymentDB
      .insertInto(TABLES.PAYMENTS)
      .values(payments)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getRazorpayByOrderId(order_id: string): Promise<Payment | null> {
    const data = await paymentDB
      .selectFrom(TABLES.PAYMENTS)
      .selectAll()
      .where('order_id', '=', order_id)
      .executeTakeFirst();
    return data ?? null;
  }

  // ─── Payment status updates ────────────────────────────────────────────────

  async updatePaymentStatus(order_id: string, status: string): Promise<Payment> {
    return await paymentDB
      .updateTable(TABLES.PAYMENTS)
      .set({ status: status as any, updated_at: new Date() })
      .where('order_id', '=', order_id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updatePaymentStatusByPaymentId(razorpay_payment_id: string, status: string): Promise<Payment> {
    return await paymentDB
      .updateTable(TABLES.PAYMENTS)
      .set({ status: status as any, updated_at: new Date() })
      .where('razorpay_payment_id', '=', razorpay_payment_id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updatePaymentStatusById(payment_id: string, status: string): Promise<Payment> {
    return await paymentDB
      .updateTable(TABLES.PAYMENTS)
      .set({ status: status as any, updated_at: new Date() })
      .where('id', '=', payment_id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  // Store razorpay_payment_id + razorpay_signature after verifyPayment succeeds
  async updatePaymentDetails(order_id: string, data: {
    razorpay_payment_id: string;
    razorpay_signature: string;
    status: string;
  }): Promise<Payment> {
    return await paymentDB
      .updateTable(TABLES.PAYMENTS)
      .set({
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
        status: data.status as any,
        updated_at: new Date(),
      })
      .where('order_id', '=', order_id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async getPaymentByRazorpayId(razorpay_payment_id: string): Promise<Payment | null> {
    const data = await paymentDB
      .selectFrom(TABLES.PAYMENTS)
      .selectAll()
      .where('razorpay_payment_id', '=', razorpay_payment_id)
      .executeTakeFirst();
    return data ?? null;
  }

  async getUserPayments(user_id: string): Promise<Payment[]> {
    return await paymentDB
      .selectFrom(TABLES.PAYMENTS)
      .selectAll()
      .where('user_id', '=', user_id)
      .orderBy('created_at', 'desc')
      .execute();
  }

  async getPaymentRefunds(payment_id: string): Promise<any[]> {
    return await refundsDB
      .selectFrom(TABLES.REFUNDS)
      .selectAll()
      .where('payment_id', '=', payment_id)
      .orderBy('created_at', 'desc')
      .execute();
  }

  // ─── Order item status updates ─────────────────────────────────────────────

  async updateOrderItemStatus(order_id: string, product_id: string, status: string): Promise<void> {
    await itemOrderDB
      .updateTable(TABLES.ORDERS_ITEMS)
      .set({
        status: status as any,
      //  updated_at: new Date(),    // FIX: was incorrectly setting reviewed_at
      })
      .where('order_id', '=', order_id)
      .where('product_id', '=', product_id)
      .execute();
  }

  async updateOrderItemStatusByOrderId(order_id: string, status: string): Promise<void> {
    await itemOrderDB
      .updateTable(TABLES.ORDERS_ITEMS)
      .set({
        status: status as any,
       // updated_at: new Date(),   
      })
      .where('order_id', '=', order_id)
      .execute();
  }

  // ─── Order status updates ──────────────────────────────────────────────────

  async updateOrderStatusByOrderId(order_id: string, status: string): Promise<void> {
    await orderDB
      .updateTable(TABLES.ORDERS)
      .set({ status: status as any, updated_at: new Date() })
      .where('id', '=', order_id)
      .execute();
  }

  // FIX: was using execute() (returns array) for a single-record lookup
  async getPaymentByInternalOrderId(order_id: string): Promise<Payment | null> {
    const data = await paymentDB
      .selectFrom(TABLES.PAYMENTS)
      .selectAll()
      .where('order_id', '=', order_id)
      .executeTakeFirst();
    return data ?? null;
  }
}