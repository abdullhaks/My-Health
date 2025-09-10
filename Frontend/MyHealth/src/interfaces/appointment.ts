export interface IAppointmentData {
  _id:string;
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