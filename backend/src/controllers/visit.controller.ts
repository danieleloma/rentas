import { Request, Response, NextFunction } from 'express';
import { VisitService } from '../services/visit.service';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';

export class VisitController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await VisitService.list(req.user!.userId, req.user!.role, pagination);
      return ApiResponse.success(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await VisitService.create({
        ...req.body,
        renterId: req.user!.userId,
      });
      return ApiResponse.created(res, visit);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await VisitService.updateStatus(
        req.params.id,
        req.user!.userId,
        req.body.status,
      );
      return ApiResponse.success(res, visit);
    } catch (err) {
      next(err);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const visit = await VisitService.cancel(req.params.id, req.user!.userId);
      return ApiResponse.success(res, visit);
    } catch (err) {
      next(err);
    }
  }
}
