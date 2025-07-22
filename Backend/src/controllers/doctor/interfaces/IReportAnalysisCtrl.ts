import { Request,Response } from "express";

export default interface IDoctorReportAnalysisCtrl {
getReports (req:Request,res:Response):Promise<void>
submitAnalysisReports (req:Request,res:Response):Promise<void>
cancelAnalysisReports (req:Request,res:Response):Promise<void>

}