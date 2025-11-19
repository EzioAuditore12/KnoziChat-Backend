import 'dotenv/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig: MongooseModuleOptions = {
  uri: process.env.DATABASE_MONGODB_URL!,
};
