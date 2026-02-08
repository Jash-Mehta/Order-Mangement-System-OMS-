import { Insertable, Selectable } from "kysely";
import { PaymentsTable } from "../payments.schema";
import { refundsDB,paymentDB, itemOrderDB, orderDB } from "../../../database/index";
import { TABLES } from "../../../database/table_name";

export type Payment = Selectable<PaymentsTable>;
export type NewPayment = Insertable<PaymentsTable>;

export class PaymentsRepsitories{
    async createPayment(payments:NewPayment): Promise<Payment> {
        return await paymentDB.insertInto(TABLES.PAYMENTS).values(payments).returningAll().executeTakeFirstOrThrow();
    }
    async getRazorpayByOrderId(order_id:string): Promise<Payment| null>{
        const data = await paymentDB.selectFrom(TABLES.PAYMENTS).selectAll().where('order_id','=',order_id).executeTakeFirst();
        if (!data) return null;
        return data;
    }

    async updatePaymentStatus(order_id: string, status: string): Promise<Payment> {
        return await paymentDB
            .updateTable(TABLES.PAYMENTS)
            .set({ 
                status: status as any,
                updated_at: new Date()
            })
            .where('order_id', '=', order_id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    async updatePaymentStatusByPaymentId(payment_id: string, status: string): Promise<Payment> {
        return await paymentDB
            .updateTable(TABLES.PAYMENTS)
            .set({ 
                status: status as any,
                updated_at: new Date()
            })
            .where('razorpay_payment_id', '=', payment_id)
            .returningAll()
            .executeTakeFirstOrThrow();
    }

    // Update OrderItem status to RESERVED_INVENTORY
        async updateOrderItemStatus(order_id: string, product_id: string, status: string): Promise<void> {
            await itemOrderDB
                .updateTable(TABLES.ORDERS_ITEMS)
                .set({
                     status: status as any,
                     reviewed_at: new Date()
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
                     reviewed_at: new Date()
                })
                .where('order_id', '=', order_id)
                .execute();
        }
        // Update Order Status to RESERVED_INVENTORY
        async updateOrderStatusByOrderId(order_id: string, status: string): Promise<void> {
            await orderDB
                .updateTable(TABLES.ORDERS)
                .set({
                     status: status as any,
                     updated_at: new Date()
                })
                .where('id', '=', order_id)
                .execute();
        }
}