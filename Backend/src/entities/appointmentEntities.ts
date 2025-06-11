import { Document, Types } from "mongoose";

export interface IAppointment {
  userId: string;
  doctorId: string;
  slotId: string;
  start: Date;
  end: Date;
  duration: number;
  fee: number;
  status: "booked" | "cancelled" | "completed" | "pending";
  stripeSessionId?: string;
  userName: string;
  userEmail: string; 
  doctorName: string; 
  doctorSpecialization: string; 
  doctorCategory?: string; 
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentDocument extends IAppointment, Document {}