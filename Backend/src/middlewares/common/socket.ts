import { Server, Socket } from "socket.io";
import { Container } from "inversify";
import IMessageService from "../../services/common/interfaces/IMessageService";
import { verifyAccessToken } from "../../utils/jwt";
import IAppointmentsRepository from "../../repositories/interfaces/IAppointmentsRepository";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: "doctor" | "user";
  };
}

const rooms = new Map<string, { users: Set<string> }>();

export const setupSocket = (io: Server, container: Container) => {
  const messageService = container.get<IMessageService>("IMessageService");
  const appointmentsRepository = container.get<IAppointmentsRepository>("IAppointmentsRepository");

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("Authentication error: No token provided.");
      return next(new Error("Authentication error: No token provided."));
    }

    try {
      const decoded = await verifyAccessToken(token);
      if (!decoded || !decoded.id || !decoded.role) {
        console.error("Authentication error: Invalid token payload.");
        return next(new Error("Authentication error: Invalid token."));
      }

      (socket as AuthenticatedSocket).data = {
        userId: decoded.id,
        role: decoded.role as "doctor" | "user",
      };
      console.log(`Socket authenticated: ${decoded.id} (${decoded.role})`);
      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      return next(new Error("Authentication error: Invalid or expired token."));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const { userId, role } = socket.data;
    console.log(`${role} connected: ${userId} (Socket ID: ${socket.id})`);

    socket.join(userId);

    socket.on("join", (conversationId: string) => {
      if (typeof conversationId !== "string" || !conversationId) {
        socket.emit("error", { message: "Invalid conversation ID." });
        return;
      }
      socket.join(conversationId);
      console.log(`${role} ${userId} joined conversation: ${conversationId}`);
    });

    socket.on("sendMessage", async (msg: { conversationId: string; senderId: string; content: string ; type:string}) => {
      if (msg.senderId !== userId) {
        console.warn(`Unauthorized message attempt by ${userId} for senderId ${msg.senderId}`);
        return socket.emit("error", { message: "Unauthorized action." });
      }

      try {
        const newMessage = await messageService.sendMessage(msg.conversationId, msg.senderId, msg.content,msg.type);
        io.to(msg.conversationId).emit("message", newMessage);
        io.to(msg.senderId).emit("message", newMessage);
      } catch (err) {
        console.error("Error sending message:", err);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    socket.on("markSeen", async ({ conversationId }: { conversationId: string }) => {
      try {
        await messageService.markMessagesAsSeen(conversationId, userId);
        io.to(conversationId).emit("messageSeen", { conversationId, userId });
      } catch (err) {
        console.error("Error marking messages as seen:", err);
        socket.emit("error", { message: "Failed to mark messages as seen." });
      }
    });

    socket.on("typing", ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit("typing", { userId, role, conversationId });
    });

    socket.on("stopTyping", ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit("stopTyping", { conversationId });
    });

    socket.on("joinVideoCall", async (appointmentId: string) => {
      if (typeof appointmentId !== "string" || !appointmentId) {
        socket.emit("error", { message: "Invalid appointment ID." });
        return;
      }

      try {
        const appointment = await appointmentsRepository.findOne({ _id: appointmentId });
        if (!appointment) {
          console.error(`Appointment not found for ID: ${appointmentId}`);
          return socket.emit("error", { message: "Appointment not found." });
        }

        if (userId !== appointment.doctorId.toString() && userId !== appointment.userId.toString()) {
          console.error(`Unauthorized access attempt to appointment ${appointmentId} by user ${userId}.`);
          return socket.emit("error", { message: "Not authorized for this appointment." });
        }

        socket.join(appointmentId);
        await appointmentsRepository.update(appointmentId, { callStartTime: new Date() });
        socket.emit("joinedVideoCall", { appointmentId });
        socket.to(appointmentId).emit("user:joined", { id: userId, role });

        if (!rooms.has(appointmentId)) {
          rooms.set(appointmentId, { users: new Set() });
        }
        const room = rooms.get(appointmentId)!;
        room.users.add(userId);
        console.log(`${role} ${userId} joined video call room: ${appointmentId}. Current room size: ${room.users.size}`);

        if (role === "doctor" && room.users.size >= 2) {
          socket.emit("startCall", { appointmentId });
          console.log(`Notified doctor ${userId} to start call for ${appointmentId}.`);
        }
      } catch (err) {
        console.error(`Error joining video call for ${userId} in ${appointmentId}:`, err);
        socket.emit("error", { message: "Failed to join video call." });
      }
    });

    socket.on("user:call", ({ to, offer }) => {
      console.log(`Received user:call from ${userId} to ${to}`);
      io.to(to).emit("incomming:call", { from: userId, offer });
    });

    socket.on("call:accepted", ({ to, ans }) => {
      console.log(`Received call:accepted from ${userId} to ${to}`);
      io.to(to).emit("call:accepted", { from: userId, ans });
    });

    socket.on("peer:nego:needed", ({ to, offer }) => {
      console.log(`Received peer:nego:needed from ${userId} to ${to}`);
      io.to(to).emit("peer:nego:needed", { from: userId, offer });
    });

    socket.on("peer:nego:done", ({ to, ans }) => {
      console.log(`Received peer:nego:done from ${userId} to ${to}`);
      io.to(to).emit("peer:nego:final", { ans });
    });

    socket.on("ice:candidate", ({ to, candidate }) => {
      console.log(`Received ICE candidate from ${userId} to ${to}`);
      io.to(to).emit("ice:candidate", { from: userId, candidate });
    });

    socket.on("mute", (data: { appointmentId: string; type: "audio" | "video"; muted: boolean }) => {
      const { appointmentId, type, muted } = data;
      console.log(`${userId} toggled ${type} to ${muted ? "muted" : "unmuted"} for ${appointmentId}.`);
      socket.to(appointmentId).emit("mute", { userId, type, muted });
    });

    socket.on("endCall", async (appointmentId: string) => {
      try {
        await appointmentsRepository.update(appointmentId, {
          callEndTime: new Date(),
          appointmentStatus: "completed",
        });
        socket.to(appointmentId).emit("callEnded", { userId });
        rooms.delete(appointmentId);
        console.log(`Call ended for appointment ${appointmentId} by user ${userId}. Room cleaned up.`);
      } catch (err) {
        console.error(`Error ending call for ${appointmentId} by ${userId}:`, err);
        socket.emit("error", { message: "Failed to end call." });
      }
    });

    socket.on("disconnect", () => {
      console.log(`${role} disconnected: ${userId} (Socket ID: ${socket.id})`);
      rooms.forEach((room, appointmentId) => {
        if (room.users.has(userId)) {
          room.users.delete(userId);
          if (room.users.size === 0) {
            rooms.delete(appointmentId);
            console.log(`Room ${appointmentId} is now empty and deleted.`);
          } else {
            socket.to(appointmentId).emit("userLeft", { userId });
            console.log(`Notified room ${appointmentId} that user ${userId} has left.`);
          }
        }
      });
    });

    socket.on("error", (err) => {
      console.error(`Socket error for ${userId}:`, err);
      socket.emit("error", { message: "Socket connection error." });
    });
  });
};




//  socket.on("joinVideoCall", async (appointmentId: string) => {
//       try {
//         const appointment = await appointmentsRepository.findOne({ _id: appointmentId });
//         if (!appointment) {
//           console.error("Appointment not found:", appointmentId);
//           return socket.emit("error", { message: "Appointment not found" });
//         }
//         // const now = new Date();
//         // if (now < appointment.start || now > appointment.end) {
//         //   console.error("Invalid appointment time:", { now, start: appointment.start, end: appointment.end });
//         //   return socket.emit("error", { message: "Appointment time has not started or has ended" });
//         // }
//         if (userId !== appointment.doctorId.toString() && userId !== appointment.userId.toString()) {
//           console.error("Unauthorized access:", { userId, appointment });
//           return socket.emit("error", { message: "Not authorized for this appointment" });
//         }

//         socket.join(appointmentId);
//         await appointmentsRepository.update(appointmentId, { callStartTime: new Date() });
//         socket.emit("joinedVideoCall", { appointmentId });
//         socket.to(appointmentId).emit("userJoined", { userId, role });

//         // Track users in the room
//         if (!rooms.has(appointmentId)) {
//           rooms.set(appointmentId, { users: new Set(), initiator: undefined });
//         }
//         const room = rooms.get(appointmentId)!;
//         room.users.add(userId);
//         console.log(`${role} ${userId} joined video call: ${appointmentId}, room size: ${room.users.size}`);

//         // Designate the first user (or doctor) as the initiator
//         if (!room.initiator) {
//           room.initiator = userId;
//           console.log(`Designated ${userId} as initiator for ${appointmentId}`);
//         }

//         // If both users are in the room, tell the initiator to start the call
//         if (room.users.size === 2) {
//           console.log(`Both users joined for ${appointmentId}, notifying initiator ${room.initiator}`);
//           io.to(room.initiator).emit("startCall");
//         }
//       } catch (err) {
//         console.error("Error joining video call:", err);
//         socket.emit("error", { message: "Failed to join video call" });
//       }
//     })