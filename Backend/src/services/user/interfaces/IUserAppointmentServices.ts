import { IAppointment } from "../../../dto/appointmentDTO";
import { IUser } from "../../../dto/userDTO";
import {IDoctor} from "../../../dto/doctorDTO";


export default interface IUserAppointmentService {
    fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<{doctors: IDoctor[] }> ,

getUserAppointments(
    userId:string,
    page: number,
    limit: number,
    filters: { appointmentStatus?: string; startDate?: string; endDate?: string }):Promise<{ appointments: IAppointment[]; totalPages: number }>,

cancelAppointment(appointmentId:string):Promise<{status:boolean;message:string;updatedUser:Partial<IUser>}>,
walletPayment(data:any):Promise<IAppointment>,
activeBooking(userId:string,doctorId:string):Promise<{status:boolean}>



};




