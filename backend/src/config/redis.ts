import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../utils/logger';

let client: Redis | null = null;

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(config.redis.url, {
      maxRetriesPerRequest: null, // required by Bull
      enableReadyCheck: false,
      lazyConnect: true,
    });

    client.on('error', (err: Error) => logger.error('Redis error', { message: err.message }));
    client.on('connect', () => logger.info('Redis connected'));
  }
  return client;
}

export async function closeRedisClient(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}

// Keep for backward-compat with Bull config
export const redisConfig = { url: config.redis.url };
