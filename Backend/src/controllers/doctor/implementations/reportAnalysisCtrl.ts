import { Request, Response } from "express";
import IDoctorReportAnalysisCtrl from "../interfaces/IReportAnalysisCtrl";
import { inject, injectable } from "inversify";
import IDoctorReportAnalysisService from "../../../services/doctor/interfaces/IDoctorReportAnalysis";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class DoctorReportAnalyisController implements IDoctorReportAnalysisCtrl {
  constructor(
    @inject("IDoctorReportAnalysisService")
    private _ReportAnalyisService: IDoctorReportAnalysisService
  ) {}

async getReports (req:Request,res:Response):Promise<any>{
    try{
        const doctorId =  req.query.doctorId;
        if(doctorId){
        const response = await this._ReportAnalyisService.getReports(doctorId.toString());
        return res.status(HttpStatusCode.OK).json(response);
        }
        return res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get analysis Reports",error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get analysis report failed"});
    }
};

async submitAnalysisReports (req:Request,res:Response):Promise<any>{
    try{
        const { analysisId, result } = req.body;
        if(!analysisId || !result){
            return res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
        }
        const response = await this._ReportAnalyisService.submitAnalysisReports(analysisId,result);

        return res.status(HttpStatusCode.OK).json(response);
    }catch(error){
        console.log("error in submit analysis Reports",error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"submit analysis report failed"});
    }
  };

  async cancelAnalysisReports (req:Request,res:Response):Promise<any>{
    try{
        const { analysisId,userId,fee } = req.body;
        if(!analysisId){
            return res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
        }
        const response = await this._ReportAnalyisService.cancelAnalysisReports(analysisId,userId,fee);
        return res.status(HttpStatusCode.OK).json(response);
    }catch(error){
        console.log("error in cancel analysis Reports",error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"cancel analysis report failed"});
    }
  }




}