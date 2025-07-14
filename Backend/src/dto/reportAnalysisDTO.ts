import { Document,Types } from "mongoose";

export interface IReportAnalysisDocument extends Document{
_id: Types.ObjectId 
doctorId: Types.ObjectId | string 
userId:Types.ObjectId | string 
concerns: String
files:Array<String>
doctorName: String
doctorCategory: String,
createdAt: Date;
fee: Number 
analysisStatus: "pending" | "cancelled" | "submited";
result: String
}

export interface IReportAnalysis extends IReportAnalysisDocument {};
