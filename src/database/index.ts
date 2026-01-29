import { Pool } from 'pg';
import { getDatabaseConfig } from '../config/env';
import { Kysely, PostgresDialect } from 'kysely';
import { ItemOrderDatabase, OrderDatabase } from '../modules/order/orders.schema';
import { UserDatabase } from '../modules/users/users.schema';
import { InventoryDatabase } from '../modules/inventory/inventory.schema';
import { InventoryReservationTable } from '../modules/inventory/inventory.reservation.schema';

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

export const reservationInventoryDB = new Kysely<InventoryReservationTable>({
  dialect: new PostgresDialect({
    pool: pgPool,
  }),
});