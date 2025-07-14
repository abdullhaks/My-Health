import {ISession} from "../../../dto/sessionDTO"

export default interface IDoctorSessionService {
    addSessions (sessionData:any):Promise<ISession[]>
    getSessions (doctorId:string):Promise<ISession[]>
}