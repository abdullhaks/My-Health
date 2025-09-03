import { Server, Socket } from "socket.io";
import { Container } from "inversify";
import IMessageService from "../../services/common/interfaces/IMessageService";
import IUserPrescriptionService from "../../services/user/interfaces/IUserPrescriptionService";
import { verifyAccessToken } from "../../utils/jwt";
import IAppointmentsRepository from "../../repositories/interfaces/IAppointmentsRepository";
import INotificationRepository from "../../repositories/interfaces/INotificationRepository";
import appointmentModel from "../../models/appointment";

interface Notification {
  date: Date;
  message: string;
  userId:string;
  type: "appointment" | "payment" | "blog" | "add" | "newConnection" | "common" | "reportAnalysis";
  isRead: boolean;
  link?: string;
  mention?: string;
 
}



interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    role: "doctor" | "user";
  };
}

const rooms = new Map<string, { users: Set<string> }>();

export const setupSocket = (io: Server, container: Container) => {
  const messageService = container.get<IMessageService>("IMessageService");
  const prescriptionService = container.get<IUserPrescriptionService>("IUserPrescriptionService");
  const appointmentsRepository = container.get<IAppointmentsRepository>("IAppointmentsRepository");
  const notificationRepository = container.get<INotificationRepository>("INotificationRepository");

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("Authentication error: No token provided.");
      // return next(new Error("Authentication error: No token provided."));
      return next();
    }

    try {
      const decoded = await verifyAccessToken(token);
      if (!decoded || !decoded.id || !decoded.role) {
        console.error("Authentication error: Invalid token payload.");
        // return next(new Error("Authentication error: Invalid token."));
        return next();
      }

      (socket as AuthenticatedSocket).data = {
        userId: decoded.id,
        role: decoded.role as "doctor" | "user",
      };
      console.log(`Socket authenticated: ${decoded.id} (${decoded.role})`);
      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      // return next(new Error("Authentication error: Invalid or expired token."));
      return next();
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


    socket.on("sendNotification", async (notification: Notification) => {
      try {

        console.log("notificarion is .....",notification);
        if (!notification || !notification.message || !notification.type || !notification.userId) {
          console.warn(`Invalid notification data from ${userId}`);
          socket.emit("error", { message: "Invalid notification data." });
          return;
        }

        const response = await notificationRepository.create(notification);

        console.log("notification created:",response);
        
        // Emit notification to the target user
        io.to(notification.userId).emit("notification", response);
        console.log(`Notification sent to user ${notification.userId}: ${notification.message}`);
      } catch (err) {
        console.error("Error sending notification:", err);
        socket.emit("error", { message: "Failed to send notification." });
      }
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

        if(appointment.appointmentStatus !== "booked") {
          console.error(`Appointment ${appointmentId} is not in booked status.`);
          return socket.emit("error", { message: `Appointment is ${appointment.appointmentStatus}.` });
        }


        if (userId !== appointment.doctorId.toString() && userId !== appointment.userId.toString()) {
          console.error(`Unauthorized access attempt to appointment ${appointmentId} by user ${userId}.`);
          return socket.emit("error", { message: "Not authorized for this appointment." });
        }



        // const now = new Date();
        // const startTime = new Date(appointment.start);
        // const endTime = new Date(appointment.end);
        // const fiveMinutesBeforeStart = new Date(startTime.getTime() - 5 * 60 * 1000);

        // if (now < fiveMinutesBeforeStart) {
        //   socket.emit("error", { message: "You can only join the meeting within 5 minutes before the start time." });
        //   return;
        // }
        // if (now > endTime) {
        //   socket.emit("error", { message: "The meeting has already ended." });
        //   return;
        // }

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


    socket.on("videoCall:sendMessage", async (msg: { 
          appointmentId: string;
          senderId: string;
          content: string;
          senderRole:string;
        }) => {
          try {
            const newMessage = {
              id: Date.now().toString(),
              senderId: msg.senderId,
              content: msg.content,
              timestamp: new Date(),
              senderRole: msg.senderRole
            };

            // Broadcast to all in the video call room
            io.to(msg.appointmentId).emit("videoCall:newMessage", newMessage);
            
          } catch (err) {
            console.error("Error handling video call message:", err);
            socket.emit("videoCall:error", { message: "Failed to send message." });
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

   socket.on("leaveCall", async (data: { appointmentId: string; role: string ; prescriptionSubmited:boolean}) => {
      const { appointmentId, role: callerRole,prescriptionSubmited } = data;
      const { userId, role } = socket.data;

      if (callerRole !== role) {
        console.warn(`Role mismatch in leaveCall for ${userId}`);
        return;
      }

      if (!rooms.has(appointmentId)) {
        console.log(`No room found for ${appointmentId} in leaveCall`);
        return;
      }

      const room = rooms.get(appointmentId)!;

      if (!room.users.has(userId)) {
        console.log(`User ${userId} not in room ${appointmentId}`);
        return;
      }

      console.log(`${role} ${userId} requesting to leave ${appointmentId}`);

      if (role === "doctor") {
        try {

          if (prescriptionSubmited) {
            const updating = await appointmentsRepository.update(appointmentId, {
              callEndTime: new Date(),
              appointmentStatus: "completed",
            });

            console.log("appointment updated after call:",updating);
            socket.emit("callEnded");
            socket.to(appointmentId).emit("callEnded");
            rooms.delete(appointmentId);
            console.log(`Call completed for ${appointmentId} by doctor ${userId}`);
          } else {
            socket.to(appointmentId).emit("doctorLeft", { userId });
            room.users.delete(userId);
            socket.emit("leaveForced");
            console.log(`Doctor ${userId} leaving ${appointmentId} without prescription`);
          }
        } catch (err) {
          console.error(`Error processing doctor leave for ${appointmentId}:`, err);
          socket.emit("error", { message: "Failed to process leave request." });
        }
      } else { // user
        socket.to(appointmentId).emit("userLeft", { userId }); 
        room.users.delete(userId);
        console.log(`User ${userId} leaving ${appointmentId}`);
      }

      if (room.users.size === 0) {
        rooms.delete(appointmentId);
        console.log(`Room ${appointmentId} emptied and deleted`);
      }
    });


    socket.on("disconnect", () => {
      console.log(`${role} disconnected: ${userId} (Socket ID: ${socket.id})`);
      rooms.forEach((room, appointmentId) => {
        if (room.users.has(userId)) {
          room.users.delete(userId);
          const leaveEvent = role === "user" ? "userLeft" : "doctorLeft";
          socket.to(appointmentId).emit(leaveEvent, { userId });
          console.log(`Emitted ${leaveEvent} for ${userId} in ${appointmentId} due to disconnect`);
          if (room.users.size === 0) {
            rooms.delete(appointmentId);
            console.log(`Room ${appointmentId} is now empty and deleted.`);
          }
        }
      });
    });

    socket.on("error", (err) => {
      console.error(`Socket error for ${userId}:`, err);
      // socket.emit("error", { message: "Socket connection error." });
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