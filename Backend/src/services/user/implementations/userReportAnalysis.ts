
import { inject,injectable } from "inversify";
import IUserReportAnalysisService from "../interfaces/IUserReportAnalysis";
import IReportAnalysisRepository from "../../../repositories/interfaces/IReportAnalysisRepository";

@injectable()
export default class UserReportAnalysisService implements IUserReportAnalysisService {

    constructor(
        @inject("IReportAnalysisRepository") private _ReportAnalysisRepository : IReportAnalysisRepository,
    ){

    };


async getReports (userId:string):Promise<any>{

    try{
        const response = await this._ReportAnalysisRepository.findAll({userId:userId});
        return response;

    }catch(error){
        console.error("Error in get sessions", error);
        throw new Error("Failed to get consultation sessions");
    }
}

};