import { Inject } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';

process.loadEnvFile();

export const pgDb = drizzle(process.env.DATABASE_POSTGRE_URL!);

export type DrizzleDB = typeof pgDb;

export const PG_DB_PROVIDER = 'pgDbProvider';

export const InjectpgDb = () => Inject(PG_DB_PROVIDER);

export const pgDbProvider = {
  provide: PG_DB_PROVIDER,
  useValue: pgDb,
};
