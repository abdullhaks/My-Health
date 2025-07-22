import { Document,Types } from "mongoose";



export interface IAnalyticsDocument extends Document{
    _id: Types.ObjectId 
    dataSet:string;
    totalUsers:number;
    totalDoctors:number;
    totalRevenue:number;
    totalPaid:number;
    totalConsultations:number;
    createdAt:Date;
    updatedAt:Date;

}