import { Server, Socket } from "socket.io";
import { Container } from "inversify";
import IMessageService from "../../services/common/interfaces/IMessageService";
import { verifyAccessToken } from "../../utils/jwt";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: "doctor" | "user";
  };
}

export const setupSocket = (io: Server, container: Container) => {
  const messageService = container.get<IMessageService>("IMessageService");

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("Token from socket:", token);
    if (!token) {
      console.error("No token provided");
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = verifyAccessToken(token);
      console.log("Decoded token:", decoded);
      if (!decoded) {
        console.error("Invalid or expired token");
        return next(new Error("Authentication error: Invalid or expired token"));
      }
      (socket as AuthenticatedSocket).data = {
        userId: decoded.id,
        role: decoded.role,
      };
      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const { userId, role } = socket.data;
    console.log(`${role} connected: ${userId}`);

    socket.join(userId);

    socket.on("join", (conversationId: string) => {
      socket.join(conversationId);
      console.log(`${role} ${userId} joined conversation: ${conversationId}`);
    });

    socket.on(
      "sendMessage",
      async (msg: { senderId: string; conversationId: string; content: string; _id?: string }) => {
        console.log("Socket sendMessage:", msg, "by userId:", userId);
        if (msg.senderId !== userId) {
          console.error("Sender ID does not match authenticated user");
          return socket.emit("error", { message: "Unauthorized action" });
        }

        try {
          const newMessage = await messageService.sendMessage(msg.conversationId, msg.senderId, msg.content);
          io.to(msg.conversationId).emit("message", newMessage); // Broadcast to conversation room
          io.to(msg.senderId).emit("message", newMessage); // Ensure sender also receives it
        } catch (err) {
          console.error("Error sending message:", err);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    socket.on("markSeen", async ({ conversationId }: { conversationId: string }) => {
        try {
          await messageService.markMessagesAsSeen(conversationId, userId);
          io.to(conversationId).emit("messageSeen", { conversationId, userId }); // Broadcast to all in room
        } catch (err) {
          console.error("Error marking messages as seen:", err);
          socket.emit("error", { message: "Failed to mark messages as seen" });
        }
      });

    socket.on("typing", ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit("typing", { userId, role, conversationId });
    });

    socket.on("stopTyping", ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit("stopTyping", { conversationId });
    });

    socket.on("disconnect", () => {
      console.log(`${role} disconnected: ${userId}`);
    });
  });
};