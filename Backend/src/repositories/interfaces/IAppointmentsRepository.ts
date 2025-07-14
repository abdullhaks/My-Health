import BaseRepository from "../implementations/baseRepository";
import { IAppointmentDocument } from "../../entities/appointmentEntities"; 


export default interface IAppointmentsRepository extends BaseRepository<IAppointmentDocument>{
getUserAppointments(userId:string,page: number,limit: number): Promise<any>,
getAppointments(page: number,limit: number): Promise<any>,
getAllAppointments(page: number, limit: number, query?: any): Promise<any>;

}