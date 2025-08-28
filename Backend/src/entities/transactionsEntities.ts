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