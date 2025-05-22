import { Server, Socket } from "socket.io";
import { Container } from "inversify";
import IMessageService from "../../services/common/interfaces/IMessageService";

export const setupSocket = (io: Server, container: Container) => {
  const messageService = container.get<IMessageService>("IMessageService");


  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(userId);

    socket.on('join', (room) => {
      socket.join(room); // Join conversation rooms
    });

    socket.on('sendMessage', async (msg) => {
      if (msg.senderId !== userId) return;
      await messageService.sendMessage(msg.conversationId, msg.senderId, msg.content);
      io.to(msg.conversationId).emit('message', msg);
    });

    socket.on('markSeen', async ({ conversationId, userId }) => {
      if (userId !== socket.data.userId) return;
      await messageService.markMessagesAsSeen(conversationId, userId);
      io.to(conversationId).emit('messageSeen', { conversationId, userId });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });
};