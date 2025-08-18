import { Request, Response } from "express";
import IUserReportAnalysisCtrl from "../interfaces/IUserReportAnalysisCtrl";
import { inject, injectable } from "inversify";
import IUserReportAnalysisService from "../../../services/user/interfaces/IUserReportAnalysis";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class UserReportAnalyisController implements IUserReportAnalysisCtrl {
  constructor(
    @inject("IUserReportAnalysisService")
    private _reportAnalyisService: IUserReportAnalysisService
  ) {}

async getReports (req:Request,res:Response):Promise<void>{
    try{
        const userId =  req.query.userId;
        if(userId){
        const response = await this._reportAnalyisService.getReports(userId.toString());
         res.status(HttpStatusCode.OK).json(response);
         return
        }
         res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get analysis Reports",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get analysis report failed"});
    }
};



async cancelAnalysisReports (req:Request,res:Response):Promise<void>{
    try{
        const { analysisId,userId,fee } = req.body;
        if(!analysisId){
             res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
             return
        }
        const response = await this._reportAnalyisService.cancelAnalysisReports(analysisId,userId,fee);
         res.status(HttpStatusCode.OK).json(response);
    }catch(error){
        console.log("error in cancel analysis Reports",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"cancel analysis report failed"});
    }
  }
}