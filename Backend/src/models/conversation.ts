import mongoose, { Schema, Document } from 'mongoose';
import { IConversationDocument } from '../entities/conversationEntities';

const ConversationSchema : Schema<IConversationDocument> = new Schema(
  {
    members: {
      type: [String],
      required: true,
    },
    updatedAt: {
       type: Date, 
       default: Date.now() },

    lastMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

const conversationModel =  mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
export default conversationModel; 