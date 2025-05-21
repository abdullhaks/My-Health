import { Document,Types } from "mongoose";


export interface IConversationDocument extends Document {
  members: string[];
  updatedAt:Date
  lastMessage?: string;
}