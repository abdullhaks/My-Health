
export default interface IDoctorReportAnalysisService {
    getReports (doctorId:string):Promise<any>
    submitAnalysisReports (analysisId:string, result:string):Promise<any>
    cancelAnalysisReports (analysisId:string,userId:string,fee:number):Promise<any>
}