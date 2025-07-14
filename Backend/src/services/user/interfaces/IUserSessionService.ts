import {ISession} from "../../../dto/sessionDTO";
import { IAppointment } from "../../../dto/appointmentDTO";

export default interface IUserSessionService {
    getSessions (doctorId:string):Promise<ISession[]>;
    getBookedSlots (doctorId:string,formattedDate:string):Promise<IAppointment[]>;
}