import { IReportAnalysis } from "../../../dto/reportAnalysisDTO";

export default interface IDoctorReportAnalysisService {
    getReports (doctorId:string):Promise<IReportAnalysis[]>
    submitAnalysisReports (analysisId:string, result:string):Promise<IReportAnalysis>
    cancelAnalysisReports (analysisId:string,userId:string,fee:number):Promise<IReportAnalysis>
}