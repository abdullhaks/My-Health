import { Document,Types } from "mongoose";



export interface ITransactionDocument extends Document{
    _id: Types.ObjectId 
    date:Date;
    from:string;
    to:string;
    method:string;
    amount:number
    paymentFor:string;
    transactionId?:string;
    appointmentId?:string;
    analysisId?:string;
    invoice?:string;
    userId?:string;
    doctorId?:string;
    createdAt:Date;
    updatedAt:Date;
}
export interface ITransactions extends ITransactionDocument {}



export interface Payout {
  _id: string;
  totalAmount: number;
  paid: number;
  serviceAmount: number;
  status:"completed" | "pending" | "failed";
  transactionId: string;
  invoiceLink: string;
  createdAt: Date;
  updatedAt: Date;
  paymentFor: "Appointment" | "Analysis";
  date: string;
  amount: number;
}

export interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}
