import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { ApiResponse } from '../utils/apiResponse';

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res);
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, 'You do not have permission to perform this action');
    }

    next();
  };
}
