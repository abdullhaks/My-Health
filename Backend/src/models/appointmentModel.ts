import { Schema, model } from "mongoose";
import { IAppointmentDocument } from "../entities/appointmentEntities";

const appointmentSchema = new Schema<IAppointmentDocument>(
  {
    userId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: String,
      required: true,
    },
    slotId: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed", "pending"],
      default: "booked",
    },
    stripeSessionId: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      required: true,
    },
    doctorSpecialization: {
      type: String,
      required: true,
    },
    doctorCategory: {
      type: String,
      required: false,
    }
    
  },
  {
    timestamps: true,
  }
);

export default model<IAppointmentDocument>("Appointment", appointmentSchema);