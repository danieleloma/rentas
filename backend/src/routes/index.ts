import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { listingRoutes } from './listing.routes';
import { messageRoutes } from './message.routes';
import { visitRoutes } from './visit.routes';
import { uploadRoutes } from './upload.routes';
import { reviewRoutes } from './review.routes';
import { reportRoutes } from './report.routes';
import { moverRoutes } from './mover.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/listings', listingRoutes);
router.use('/conversations', messageRoutes);
router.use('/visits', visitRoutes);
router.use('/upload', uploadRoutes);
router.use('/reviews', reviewRoutes);
router.use('/reports', reportRoutes);
router.use('/movers', moverRoutes);

export { router as routes };
