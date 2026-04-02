import { Router } from 'express';
import { VisitController } from '../controllers/visit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const createVisitSchema = z.object({
  listingId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  viewingType: z.enum(['in_person', 'video_call']).optional(),
  note: z.string().max(500).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed', 'cancelled']),
});

router.get('/', authenticate, VisitController.list);
router.post('/', authenticate, validate(createVisitSchema), VisitController.create);
router.put('/:id/status', authenticate, validate(updateStatusSchema), VisitController.updateStatus);
router.put('/:id/cancel', authenticate, VisitController.cancel);

export { router as visitRoutes };
