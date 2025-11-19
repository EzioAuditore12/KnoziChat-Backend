import 'dotenv/config';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ThrottlerModuleOptions, seconds } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'short',
      limit: 5,
      ttl: seconds(5),
    },
    {
      name: 'medium',
      limit: 15,
      ttl: seconds(60),
    },
    {
      name: 'long',
      limit: 40,
      ttl: seconds(600),
    },
  ],
  errorMessage: 'Please slow down please',
  storage: new ThrottlerStorageRedisService(process.env.REDIS_URL),
  getTracker: (req: { headers: Record<string, string> }): string => {
    return req.headers['x-tenant-id'];
  },
};
