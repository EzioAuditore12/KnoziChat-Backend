import { MongooseModuleOptions } from '@nestjs/mongoose';

import { env } from 'apps/env';

export const mongooseConfig: MongooseModuleOptions = {
  uri: env.DATABASE_MONGODB_URL,
};
