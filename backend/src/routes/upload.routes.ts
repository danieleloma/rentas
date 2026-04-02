import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.post(
  '/listing-image',
  authenticate,
  authorize('landlord', 'admin'),
  UploadController.uploadListingImage,
);

export { router as uploadRoutes };
