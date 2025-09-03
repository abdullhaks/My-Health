import { Document, Types } from "mongoose";

export interface IAppointmentDocument extends  Document {
  _id:Types.ObjectId;
  userId: string;
  doctorId: string;
  slotId: string;
  sessionId:string;
  date:string;
  start: Date;
  end: Date;
  duration: number;
  fee: number;
  appointmentStatus: "booked" | "cancelled" | "completed" | "pending";
  transactionId?: string;
  userName: string;
  userEmail: string; 
  doctorName: string; 
  doctorSpecialization?: string; 
  paymentType: "stripe" | "wallet";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  doctorCategory?: string; 
  callStartTime?: Date;
  callEndTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointment extends IAppointmentDocument {};


// src/dto/appointmentDTO.ts
export interface IAppointmentDTO {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  doctorId: string;
  doctorName: string;
  doctorCategory?: string;
  date: string;
  start: Date;
  end: Date;
  duration: number;
  fee: number;
  transactionId?: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  paymentType: "stripe" | "wallet";
  appointmentStatus: "booked" | "cancelled" | "completed" | "pending";
  callStartTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  slotId: string;
}
