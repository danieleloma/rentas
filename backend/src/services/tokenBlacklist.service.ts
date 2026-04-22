import crypto from 'crypto';
import { getRedisClient } from '../config/redis';

const PREFIX = 'token:bl:';

export class TokenBlacklistService {
  private static key(token: string): string {
    return PREFIX + crypto.createHash('sha256').update(token).digest('hex');
  }

  static async blacklist(token: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return;
    await getRedisClient().set(this.key(token), '1', 'EX', ttlSeconds);
  }

  static async isBlacklisted(token: string): Promise<boolean> {
    const result = await getRedisClient().get(this.key(token));
    return result !== null;
  }
}
