import { BullRootModuleOptions } from '@nestjs/bullmq';

import { env } from 'src/env';

export const bullMQConfig: BullRootModuleOptions = {
  connection: {
    url: env.REDIS_URL,
  },
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: 1000,
    removeOnFail: 3000,
    backoff: 2000,
  },
};
