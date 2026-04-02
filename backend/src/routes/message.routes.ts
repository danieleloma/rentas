import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';

const router = Router();

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'document', 'voice']).optional(),
  mediaUrl: z.string().url().optional(),
  listingId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional(),
});

router.get('/', authenticate, MessageController.getConversations);
router.get('/:id/messages', authenticate, MessageController.getMessages);
router.post('/:id/messages', authenticate, validate(sendMessageSchema), MessageController.sendMessage);

export { router as messageRoutes };
