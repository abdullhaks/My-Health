
export default interface IDoctorSessionService {
    addSessions (sessionData:any):Promise<any>
    getSessions (doctorId:string):Promise<any>
}