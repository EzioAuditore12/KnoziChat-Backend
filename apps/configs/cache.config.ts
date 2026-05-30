import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory } from 'cacheable';
import { env } from 'apps/env';

export const createCacheOptions = () => ({
  stores: [
    new Keyv({
      store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
    }),
    new KeyvRedis(env.REDIS_URL),
  ],
});
