import {ISession} from "../../../dto/sessionDTO"
import { IAppointment } from "../../../dto/appointmentDTO";


export default interface IDoctorSessionService {
    addSessions (sessionData:any):Promise<ISession[]>
    getSessions (doctorId:string):Promise<ISession[]>
    getBookedSlots (doctorId:string,formattedDate:string):Promise<IAppointment[]>;
    deleteSession (sessionId:string):Promise<void>
    
}