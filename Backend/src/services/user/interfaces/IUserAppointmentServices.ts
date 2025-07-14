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

getUserAppointments(userId:string,pageNumber:number, limitNumber:number):Promise<IAppointment[]>,
cancelAppointment(appointmentId:string):Promise<{status:boolean;message:string;updatedUser:Partial<IUser>}>,
walletPayment(data:any):Promise<IAppointment>,
};




