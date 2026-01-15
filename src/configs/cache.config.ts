import { Keyv } from 'keyv';
import KeyvRedis from '@keyv/redis';
import { CacheableMemory } from 'cacheable';

process.loadEnvFile();

export const createCacheOptions = () => ({
  stores: [
    new Keyv({
      store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
    }),
    new KeyvRedis(process.env.REDIS_URL),
  ],
});
