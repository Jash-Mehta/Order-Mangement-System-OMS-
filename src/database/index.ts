import { Pool } from 'pg';
import { getDatabaseConfig } from '../config/env';
import { Kysely, PostgresDialect } from 'kysely';
import { ItemOrderDatabase, OrderDatabase } from '../modules/order/orders.schema';
import { UserDatabase } from '../modules/users/users.schema';
import { InventoryDatabase } from '../modules/inventory/inventory.schema';
import { InventoryReservationDatabase } from '../modules/inventory/inventory.reservation.schema';
import { PaymentDatabase } from '../modules/payment/payments.schema';
import { RefundDatabase } from '../modules/payment/payment.refund.schema';

export const pgPool = new Pool(getDatabaseConfig());

export const orderDB = new Kysely<OrderDatabase>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});

export const userDB = new Kysely<UserDatabase>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});

export const itemOrderDB = new Kysely<ItemOrderDatabase>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});

export const inventoryDB = new Kysely<InventoryDatabase>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});

export const reservationInventoryDB = new Kysely<InventoryReservationDatabase>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});
export const paymentDB = new Kysely<PaymentDatabase>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});
export const refundsDB = new Kysely<RefundDatabase>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});