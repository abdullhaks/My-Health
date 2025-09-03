import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";


 interface filter {
    status?:string;
    doctorCategory?:string;
    startDate?:string;
    endDate?:string;
  }


export default interface IAdminAppointmentsService {

getAppointments(pageNumber:number, limitNumber:number,filters: filter):Promise<{appointments:IAppointmentDTO[] | null,totalPages:number | null}>,

};




