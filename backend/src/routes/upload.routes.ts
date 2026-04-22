import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { AppError } from '../middleware/errorHandler.middleware';

const router = Router();

const listingImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new AppError(400, 'BAD_REQUEST', 'Only JPEG, PNG, WebP, and GIF images are allowed'));
  },
});

router.post(
  '/listing-image',
  authenticate,
  authorize('landlord', 'admin'),
  (req, res, next) => {
    listingImageUpload.single('file')(req, res, (err) => {
      if (err) {
        next(err);
        return;
      }
      next();
    });
  },
  UploadController.uploadListingImage,
);

export { router as uploadRoutes };
