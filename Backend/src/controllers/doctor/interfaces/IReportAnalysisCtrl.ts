import { Request,Response } from "express";

export default interface IDoctorReportAnalysisCtrl {
getReports (req:Request,res:Response):Promise<any>
submitAnalysisReports (req:Request,res:Response):Promise<any>
cancelAnalysisReports (req:Request,res:Response):Promise<any>

}