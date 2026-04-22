import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute

export function rateLimit(maxRequests = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(key);

    if (!entry || now > entry.resetAt) {
      requestCounts.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return next();
    }

    if (entry.count >= maxRequests) {
      return ApiResponse.tooManyRequests(res);
    }

    entry.count++;
    next();
  };
}
