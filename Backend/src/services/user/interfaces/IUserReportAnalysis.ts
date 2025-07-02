
export default interface IUserReportAnalysisService {
    getReports (doctorId:string):Promise<any>
}