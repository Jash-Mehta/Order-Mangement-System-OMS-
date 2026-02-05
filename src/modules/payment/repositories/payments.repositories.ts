import { Insertable, Selectable } from "kysely";
import { PaymentsTable } from "../payments.schema";
import { refundsDB,paymentDB } from "../../../database/index";
import { TABLES } from "../../../database/table_name";

export type Payment = Selectable<PaymentsTable>;
export type NewPayment = Insertable<PaymentsTable>;

export class PaymentsRepsitories{
    async createPayment(payments:NewPayment): Promise<Payment> {
        return await paymentDB.insertInto(TABLES.PAYMENTS).values(payments).returningAll().executeTakeFirstOrThrow();
    }
}