import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { StorageService } from '../services/storage.service';
import { isSupabaseStorageConfigured } from '../config/supabase';
import { ApiResponse } from '../utils/apiResponse';
import { AppError } from '../middleware/errorHandler.middleware';

export class UploadController {
  static async uploadListingImage(req: Request, res: Response, next: NextFunction) {
    try {
      const listingId = req.body.listingId as string | undefined;
      const thumbnailUrl = req.body.thumbnailUrl as string | undefined;
      const isVirtualTour =
        req.body.isVirtualTour === true || req.body.isVirtualTour === 'true';

      if (!listingId) {
        throw new AppError(400, 'BAD_REQUEST', 'listingId is required');
      }

      let url: string | undefined = typeof req.body.url === 'string' ? req.body.url : undefined;

      if (req.file) {
        if (!isSupabaseStorageConfigured()) {
          throw new AppError(
            503,
            'STORAGE_UNAVAILABLE',
            'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and create the bucket (see .env.example) to upload files.',
          );
        }
        url = await StorageService.uploadListingImage(
          listingId,
          req.file.buffer,
          req.file.mimetype,
          req.file.originalname,
        );
      }

      if (!url) {
        throw new AppError(
          400,
          'BAD_REQUEST',
          'Send multipart/form-data with field "file" and "listingId", or JSON with "listingId" and "url".',
        );
      }

      const image = await UploadService.addListingImage(listingId, req.user!.userId, {
        url,
        thumbnailUrl,
        isVirtualTour,
      });
      return ApiResponse.created(res, image);
    } catch (err) {
      next(err);
    }
  }
}
