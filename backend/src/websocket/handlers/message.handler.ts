import { Server, Socket } from 'socket.io';
import { logger } from '../../utils/logger';

export function registerMessageHandlers(io: Server, socket: Socket) {
  socket.on('message:new', (data: { conversationId: string; content: string }) => {
    const userId = socket.data.user.userId;
    logger.debug(`New message from ${userId} in conversation ${data.conversationId}`);

    io.to(`conversation:${data.conversationId}`).emit('message:new', {
      senderId: userId,
      ...data,
      createdAt: new Date().toISOString(),
    });
  });

  socket.on('message:read', (data: { messageId: string; conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('message:read', {
      messageId: data.messageId,
      readBy: socket.data.user.userId,
    });
  });

  socket.on('typing:start', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
      userId: socket.data.user.userId,
      conversationId: data.conversationId,
    });
  });

  socket.on('typing:stop', (data: { conversationId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      userId: socket.data.user.userId,
      conversationId: data.conversationId,
    });
  });

  socket.on('conversation:join', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
  });

  socket.on('conversation:leave', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
  });
}
