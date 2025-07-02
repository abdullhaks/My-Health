import { Request, Response } from "express";
import IUserReportAnalysisCtrl from "../interfaces/IReportAnalysisCtrl";
import { inject, injectable } from "inversify";
import IUserReportAnalysisService from "../../../services/user/interfaces/IUserReportAnalysis";

@injectable()
export default class UserReportAnalyisController implements IUserReportAnalysisCtrl {
  constructor(
    @inject("IUserReportAnalysisService")
    private _ReportAnalyisService: IUserReportAnalysisService
  ) {}

async getReports (req:Request,res:Response):Promise<any>{
    try{
        const userId =  req.query.userId;
        if(userId){
        const response = await this._ReportAnalyisService.getReports(userId.toString());
        return res.status(200).json(response);
        }
        return res.status(401).json({message:"bad request"});


    }catch(error){
        console.log("error in get analysis Reports",error);
        return res.status(500).json({message:"get analysis report failed"});
    }
}
}