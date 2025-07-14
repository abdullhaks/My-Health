import { IReportAnalysis } from "../../../dto/reportAnalysisDTO";
import {IUser} from "../../../dto/userDTO";

export default interface IUserReportAnalysisService {
    getReports (doctorId:string):Promise<IReportAnalysis[]>
    cancelAnalysisReports (analysisId:string,userId:string,fee:number):Promise<{userWithoutPassword:Partial<IUser> ;response:IReportAnalysis}>

}