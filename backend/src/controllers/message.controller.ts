import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';
import { ApiResponse } from '../utils/apiResponse';
import { parsePagination } from '../utils/pagination';

export class MessageController {
  static async getConversations(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await MessageService.getConversations(req.user!.userId, pagination);
      return ApiResponse.success(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  static async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const pagination = parsePagination(req.query as Record<string, unknown>);
      const result = await MessageService.getMessages(
        String(req.params.id),
        req.user!.userId,
        pagination,
      );
      return ApiResponse.success(res, result.data, 200, result.meta);
    } catch (err) {
      next(err);
    }
  }

  static async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.sendMessage({
        conversationId: String(req.params.id),
        senderId: req.user!.userId,
        ...req.body,
      });
      return ApiResponse.created(res, message);
    } catch (err) {
      next(err);
    }
  }
}
