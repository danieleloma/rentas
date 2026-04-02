import { Request, Response, NextFunction } from 'express';
import { UploadService } from '../services/upload.service';
import { ApiResponse } from '../utils/apiResponse';

export class UploadController {
  static async uploadListingImage(req: Request, res: Response, next: NextFunction) {
    try {
      // In production, file would be uploaded to S3 and URL returned
      // For now, return a placeholder response
      const { listingId, url, thumbnailUrl, isVirtualTour } = req.body;
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
