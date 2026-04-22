import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200, meta?: Record<string, unknown>) {
    return res.status(statusCode).json({
      success: true,
      data,
      ...(meta && { meta }),
    });
  }

  static created<T>(res: Response, data: T) {
    return ApiResponse.success(res, data, 201);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }

  static error(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: unknown[],
  ) {
    return res.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
    });
  }

  static badRequest(res: Response, message: string, details?: unknown[]) {
    return ApiResponse.error(res, 400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return ApiResponse.error(res, 401, 'UNAUTHORIZED', message);
  }

  static forbidden(res: Response, message = 'Forbidden') {
    return ApiResponse.error(res, 403, 'FORBIDDEN', message);
  }

  static notFound(res: Response, message = 'Not found') {
    return ApiResponse.error(res, 404, 'NOT_FOUND', message);
  }

  static conflict(res: Response, message: string) {
    return ApiResponse.error(res, 409, 'CONFLICT', message);
  }

  static tooManyRequests(res: Response, message = 'Too many requests') {
    return ApiResponse.error(res, 429, 'TOO_MANY_REQUESTS', message);
  }

  static internal(res: Response, message = 'Internal server error') {
    return ApiResponse.error(res, 500, 'INTERNAL_ERROR', message);
  }
}
