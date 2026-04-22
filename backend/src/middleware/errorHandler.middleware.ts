import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.statusCode, err.code, err.message, err.details);
  }

  if (err instanceof MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 10MB)' : err.message;
    return ApiResponse.error(res, 400, 'BAD_REQUEST', message);
  }

  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  return ApiResponse.internal(res);
}
