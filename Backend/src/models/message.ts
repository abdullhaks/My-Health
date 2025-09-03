import mongoose, { Schema, Document } from 'mongoose';
import { IMessageDocument } from '../entities/messageEntities';

const MessageSchema = new Schema<IMessageDocument>({
  conversationId: { type: String, required: true },
  senderId: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, default: "text" }, 
  timestamp: { type: String, default: () => new Date().toISOString() },
  readBy: { type: [String], default: [] },
  status: { type: String, default: "sent" },
});

MessageSchema.index({ conversationId: 1, timestamp: 1 });

export default mongoose.model<IMessageDocument>('Message', MessageSchema);