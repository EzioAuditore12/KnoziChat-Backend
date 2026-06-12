import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { env } from 'apps/env';

process.loadEnvFile();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: env.DATABASE_POSTGRE_URL,
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
};
