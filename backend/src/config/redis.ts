import { config } from './index';

// Redis client placeholder — initialize when redis package is added
// For Phase 1, Bull handles its own Redis connection via config.redis.url

export const redisConfig = {
  url: config.redis.url,
};
