import {ISession, ISessionDocument} from "../../../dto/sessionDTO"
import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IUnAvailableDayDocument } from "../../../entities/unAvailableDayEntities";
import { IUnAvailableSessionDocument } from "../../../entities/unAvailableSessionEntities";
interface cancelledSessions  { appointmentId: string; userId: string;doctorName:string; date: string; start: Date; end: Date; }

export default interface IDoctorSessionService {
    addSession (sessionData:ISession):Promise<ISession>
    getSessions (doctorId:string):Promise<ISession[]>
    getBookedSlots (doctorId:string,formattedDate:string):Promise<string[]>;
    deleteSession (sessionId:string):Promise<Partial<IAppointmentDTO>[]|null>
    updateSession (sessionId:string, editingSession:Partial<ISession>):Promise<{updatedSession:ISessionDocument|null,cancelledAppoitments:cancelledSessions[]|null}>;
    makeDayUnavailable(doctorId:string,day:Date):Promise<{unavailableDay:IUnAvailableDayDocument|null,cancelledAppoitments:cancelledSessions[]|[]}>
    makeDayAvailable(doctorId:string,day:Date):Promise<IUnAvailableDayDocument|null>
    getUnavailableDays(doctorId:string):Promise<String[]|null>
    unAvailableSessions(doctorId:string,day:Date, sessionId:string):Promise<{unAvailableSessions:IUnAvailableSessionDocument|null,cancelledAppoitments:cancelledSessions[]|null}>
    makeSessionsAvailable(doctorId:string, day:Date, sessionId:string):Promise<IUnAvailableSessionDocument | null>
    getUnavailablSessions(doctorId:string):Promise<{ day: String; sessionId: string }[] | [] |null>

}