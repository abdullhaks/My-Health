import BaseRepository from "../implementations/baseRepository";
import { IAppointmentDocument } from "../../entities/appointmentEntities"; 
import { IAppointment, IAppointmentDTO } from "../../dto/appointmentDTO";
import { FilterQuery } from "mongoose";



export default interface IAppointmentsRepository extends BaseRepository<IAppointmentDocument>{
getUserAppointments(userId:string,page: number,limit: number): Promise<{appointments:IAppointment[] | null,totalPages:number | null}>,
getAppointments(page: number,limit: number): Promise<{appointments:IAppointment[] | null,totalPages:number | null}>,
getAllAppointments(page: number, limit: number, query?: FilterQuery<IAppointment>): Promise<{appointments:IAppointmentDTO[] | null,totalPages:number}>;
getAllAppointmentsAdmin(page: number, limit: number, query?: FilterQuery<IAppointment>): Promise<{appointments:IAppointmentDTO[] | null,totalPages:number | null}>;

}