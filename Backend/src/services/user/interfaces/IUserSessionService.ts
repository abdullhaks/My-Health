import {ISession} from "../../../dto/sessionDTO";
import { IAppointment } from "../../../dto/appointmentDTO";

export default interface IUserSessionService {
    getSessions (doctorId:string):Promise<ISession[]>;
    getBookedSlots (doctorId:string,formattedDate:string):Promise<IAppointment[]>;
    getUnavailableDays(doctorId:string):Promise<String[]>;
    getUnavailablSessions(doctorId:string):Promise<{ day: String; sessionId: string }[]>;


}