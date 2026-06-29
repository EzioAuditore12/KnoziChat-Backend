import KeyvRedis from '@keyv/redis';
import { env } from 'apps/env';
import { CacheableMemory } from 'cacheable';
import { Keyv } from 'keyv';

export const createCacheOptions = () => ({
  stores: [
    new Keyv({
      store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
    }),
    new KeyvRedis(env.REDIS_URL),
  ],
});
