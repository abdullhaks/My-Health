
import { inject,injectable } from "inversify";
import IDoctorReportAnalysisService from "../interfaces/IDoctorReportAnalysis";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";

@injectable()
export default class DoctorReportAnalysisService implements IDoctorReportAnalysisService {

    constructor(
        @inject("IReportAnalysisRepository") private _ReportAnalysisRepository : IReportAnalysisRepository,
        @inject("IUserRepository") private _UserRepository: IUserRepository
    ){

    };


async getReports (doctorId:string):Promise<any>{

    try{
        const response = await this._ReportAnalysisRepository.findAll({doctorId:doctorId});
        return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
};



async submitAnalysisReports (analysisId:string, result:string):Promise<any>{
    try{
        const response = await this._ReportAnalysisRepository.update(analysisId, { result: result, analysisStatus: "submited" });
        return response;

    }catch(error){
        console.error("Error in submitting analysis reports", error);
        throw new Error("Failed to submit analysis report");
    }

};

async cancelAnalysisReports (analysisId:string , userId:string , fee: number):Promise<any>{
    try{
        
        if(!analysisId || !userId || fee <= 0){
            throw new Error("Invalid parameters for cancelling analysis report");
        }

        console.log("Cancelling analysis report with ID:", analysisId, "for user ID:", userId, "with fee:", fee);
        const walletUpdate = await this._UserRepository.update(userId, { $inc: { walletBalance: fee } });
        
        if(walletUpdate){
            const response = await this._ReportAnalysisRepository.update(analysisId, { analysisStatus: "cancelled" });
             return response;
        }else{
                console.error("Failed to update wallet balance");
                throw new Error("Failed to update wallet balance");
        }
      

    }catch(error){
        console.error("Error in cancelling analysis reports", error);
        throw new Error("Failed to cancel analysis report");
    }


};

}