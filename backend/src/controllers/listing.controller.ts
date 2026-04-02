import { Request, Response, NextFunction } from 'express';
import { ListingService } from '../services/listing.service';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';

export class ListingController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const filters = {
        city: req.query.city as string | undefined,
        state: req.query.state as string | undefined,
        zipCode: req.query.zipCode as string | undefined,
        propertyType: req.query.propertyType as string | undefined,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
        bathrooms: req.query.bathrooms ? Number(req.query.bathrooms) : undefined,
        minSqft: req.query.minSqft ? Number(req.query.minSqft) : undefined,
        maxSqft: req.query.maxSqft ? Number(req.query.maxSqft) : undefined,
        keyword: req.query.keyword as string | undefined,
      };

      const result = await ListingService.list(filters, pagination);
      return ApiResponse.success(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await ListingService.getById(req.params.id);
      return ApiResponse.success(res, listing);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await ListingService.create(req.user!.userId, req.body);
      return ApiResponse.created(res, listing);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const listing = await ListingService.update(req.params.id, req.user!.userId, req.body);
      return ApiResponse.success(res, listing);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ListingService.delete(req.params.id, req.user!.userId);
      return ApiResponse.noContent(res);
    } catch (err) {
      next(err);
    }
  }

  static async toggleFavorite(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ListingService.toggleFavorite(req.user!.userId, req.params.id);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  static async getFavorites(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await ListingService.getFavorites(req.user!.userId, pagination);
      return ApiResponse.success(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }
}
