import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_POSTGRE_URL,
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
};
