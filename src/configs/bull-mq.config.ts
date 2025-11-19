import 'dotenv/config';

import { BullRootModuleOptions } from '@nestjs/bullmq';

export const bullMQConfig: BullRootModuleOptions = {
  connection: {
    url: process.env.REDIS_URL,
  },
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: 1000,
    removeOnFail: 3000,
    backoff: 2000,
  },
};
