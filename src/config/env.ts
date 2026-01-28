import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? null,
  db: {
    host: process.env.DB_HOST ?? null,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : null,
    user: process.env.DB_USER ?? null,
    password: process.env.DB_PASSWORD ?? null,
    database: process.env.DB_NAME ?? null
  }
};

export function getDatabaseConfig() {
  if (env.databaseUrl) {
    return { connectionString: env.databaseUrl };
  }

  const host = env.db.host ?? requireEnv('DB_HOST');
  const port = env.db.port ?? Number(requireEnv('DB_PORT'));
  const user = env.db.user ?? requireEnv('DB_USER');
  const password = env.db.password ?? requireEnv('DB_PASSWORD');
  const database = env.db.database ?? requireEnv('DB_NAME');

  return { host, port, user, password, database };
}
