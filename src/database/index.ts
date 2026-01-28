import { Pool } from 'pg';
import { getDatabaseConfig } from '../config/env';
import { Kysely, PostgresDialect } from 'kysely';
import { OrderDatabase } from '../modules/order/orders.schema';
import { UserDatabase } from '../modules/users/users.schema';

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

