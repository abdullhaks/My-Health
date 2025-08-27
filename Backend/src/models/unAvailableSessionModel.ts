import mongoose, { Schema, Document } from "mongoose";
import { IUnAvailableSessionDocument } from "../entities/unAvailableSessionEntities"; 

const unAvailableSessionSchema: Schema<IUnAvailableSessionDocument> = new Schema(
  {
    doctorId: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true }, 
  }
);

const unAvailableSessionModel = mongoose.model<IUnAvailableSessionDocument>("UnAvailableSession", unAvailableSessionSchema);

export default unAvailableSessionModel;