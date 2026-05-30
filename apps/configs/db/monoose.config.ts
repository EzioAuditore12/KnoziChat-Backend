import { MongooseModuleOptions } from '@nestjs/mongoose';

process.loadEnvFile();

export const mongooseConfig: MongooseModuleOptions = {
  uri: process.env.DATABASE_MONGODB_URL!,
};
