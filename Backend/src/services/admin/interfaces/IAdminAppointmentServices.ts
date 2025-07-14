import { IAppointment } from "../../../dto/appointmentDTO";


 interface filter {
    status?:string;
    doctorCategory?:string;
    startDate?:string;
    endDate?:string;
  }


export default interface IAdminAppointmentsService {

getAppointments(pageNumber:number, limitNumber:number,filters: filter):Promise<IAppointment[]>,

};




