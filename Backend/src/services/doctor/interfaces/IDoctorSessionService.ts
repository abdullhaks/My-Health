import {ISession} from "../../../dto/sessionDTO"
import { IAppointment } from "../../../dto/appointmentDTO";


export default interface IDoctorSessionService {
    addSession (sessionData:any):Promise<ISession>
    getSessions (doctorId:string):Promise<ISession[]>
    getBookedSlots (doctorId:string,formattedDate:string):Promise<IAppointment[]>;
    deleteSession (sessionId:string):Promise<void>
    updateSession (sessionId:string, editingSession:any):Promise<ISession>;
    makeDayUnavailable(doctorId:string,day:Date):Promise<any>
    getUnavailableDays(doctorId:string):Promise<any>
    unAvailableSessions(doctorId:string,day:Date, sessionId:any):Promise<any>
    getUnavailablSessions(doctorId:string):Promise<any>
    
}