import mongoose, { Schema, Document } from "mongoose";
import { IUnAvailableDayDocument } from "../entities/unAvailableDayEntities";

const unAvailableDaySchema: Schema<IUnAvailableDayDocument> = new Schema(
  {
    doctorId: {
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

const unAvailableDayModel = mongoose.model<IUnAvailableDayDocument>("UnAvailableDay", unAvailableDaySchema);

export default unAvailableDayModel;