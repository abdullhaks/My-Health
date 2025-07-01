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
    appointmentStatus: {
      type: String,
      enum: ["booked", "cancelled", "completed", "pending",],
      default: "booked",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
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
      required: false,
    },
    doctorCategory: {
      type: String,
      required: false,
    },
    callStartTime:{
    type:Date,
    reuired:false
    },
    callEndTime:{
      type:Date,
      required:false
    },

  },
  
  {
    timestamps: true,
  }
);

export default model<IAppointmentDocument>("Appointment", appointmentSchema);