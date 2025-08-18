import { Request,Response } from "express";

export default interface IUserReportAnalysisCtrl {
getReports (req:Request,res:Response):Promise<void>
cancelAnalysisReports (req:Request,res:Response):Promise<void>

}