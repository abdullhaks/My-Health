import { Document,Types } from "mongoose";



export interface IPayoutDocument extends Document{
    _id: Types.ObjectId; 
    doctorId?:string;
    bankAccNo:string;
    bankAccHolderName:string;
    bankIfscCode:string;
    totalAmount:number;
    paid:number;
    serviceAmount:number
    status:string;
    on:Date;
    transactionId:string;
    invoiceLink?:string;
    createdAt:Date;
    updatedAt:Date;
}