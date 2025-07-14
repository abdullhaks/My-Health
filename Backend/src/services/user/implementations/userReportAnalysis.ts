
import { inject,injectable } from "inversify";
import IUserReportAnalysisService from "../interfaces/IUserReportAnalysis";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import { IReportAnalysis } from "../../../dto/reportAnalysisDTO";
import {IUser} from "../../../dto/userDTO";

@injectable()
export default class UserReportAnalysisService implements IUserReportAnalysisService {

    constructor(
        @inject("IReportAnalysisRepository") private _ReportAnalysisRepository : IReportAnalysisRepository,
        @inject("IUserRepository") private _UserRepository: IUserRepository
        
    ){

    };


async getReports (userId:string):Promise<IReportAnalysis[]>{

    try{
        const response = await this._ReportAnalysisRepository.findAll({userId:userId});
        return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
};



async cancelAnalysisReports (analysisId:string , userId:string , fee: number):Promise<{userWithoutPassword:Partial<IUser> ;response:IReportAnalysis}>{
    try{
        
        if(!analysisId || !userId || fee <= 0){
            throw new Error("Invalid parameters for cancelling analysis report");
        }

        console.log("Cancelling analysis report with ID:", analysisId, "for user ID:", userId, "with fee:", fee);
        var walletUpdate = await this._UserRepository.update(userId, { $inc: { walletBalance: fee } });
        
        if(walletUpdate){
            const { password, ...userWithoutPassword } = walletUpdate.toObject();
                    if(userWithoutPassword.profile){
                    userWithoutPassword.profile = await getSignedImageURL(userWithoutPassword.profile)
                    };
            const response = await this._ReportAnalysisRepository.update(analysisId, { analysisStatus: "cancelled" });
            if (!response) {
                throw new Error("Failed to update analysis report status");
            }
            return { userWithoutPassword, response };
        }else{
                console.error("Failed to update wallet balance");
                throw new Error("Failed to update wallet balance");
        }
      

    }catch(error){
        console.error("Error in cancelling analysis reports", error);
        throw new Error("Failed to cancel analysis report");
    }


};

};