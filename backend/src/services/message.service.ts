import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler.middleware';
import { PaginationParams, paginationMeta, paginationSkip } from '../utils/pagination';

export class MessageService {
  static async getConversations(userId: string, pagination: PaginationParams) {
    const where = {
      OR: [{ participantOneId: userId }, { participantTwoId: userId }],
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          listing: {
            select: { id: true, title: true, images: { take: 1, orderBy: { position: 'asc' } } },
          },
          participantOne: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          participantTwo: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { content: true, createdAt: true, senderId: true, isRead: true },
          },
        },
        orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
        skip: paginationSkip(pagination),
        take: pagination.limit,
      }),
      prisma.conversation.count({ where }),
    ]);

    return { data: conversations, meta: paginationMeta(total, pagination) };
  }

  static async getMessages(conversationId: string, userId: string, pagination: PaginationParams) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
    }

    if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Not a participant in this conversation');
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: paginationSkip(pagination),
        take: pagination.limit,
      }),
      prisma.message.count({ where: { conversationId } }),
    ]);

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return { data: messages.reverse(), meta: paginationMeta(total, pagination) };
  }

  static async sendMessage(data: {
    conversationId?: string;
    listingId?: string;
    recipientId?: string;
    senderId: string;
    content: string;
    messageType?: string;
    mediaUrl?: string;
  }) {
    let conversationId = data.conversationId;

    if (!conversationId && data.listingId && data.recipientId) {
      const [p1, p2] =
        data.senderId < data.recipientId
          ? [data.senderId, data.recipientId]
          : [data.recipientId, data.senderId];

      let conversation = await prisma.conversation.findUnique({
        where: {
          participantOneId_participantTwoId_listingId: {
            participantOneId: p1,
            participantTwoId: p2,
            listingId: data.listingId,
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            listingId: data.listingId,
            participantOneId: p1,
            participantTwoId: p2,
          },
        });
      }

      conversationId = conversation.id;
    }

    if (!conversationId) {
      throw new AppError(400, 'BAD_REQUEST', 'conversationId or listingId+recipientId required');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: data.senderId,
        content: data.content,
        messageType: data.messageType || 'text',
        mediaUrl: data.mediaUrl,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }
}
