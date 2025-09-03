import { inject , injectable } from "inversify";
import IAdminAppointmentsService from "../interfaces/IAdminAppointmentServices";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";


 interface filter {
    status?:string;
    doctorCategory?:string;
    startDate?:string;
    endDate?:string;
  }

@injectable()

export default class AdminAppointmentService implements IAdminAppointmentsService {

    constructor(
     
      @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository,
      @inject("IUserRepository") private _userRepository: IUserRepository,
      @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository
      
    ){
    
    }

 

 async getAppointments(pageNumber: number, limitNumber: number, filters: filter = {}): Promise<{appointments:IAppointmentDTO[] | null,totalPages:number | null}> {
    const query: any = {};

    if (filters.status) {
      query.appointmentStatus = filters.status;
    }
    if (filters.doctorCategory) {
      // query.doctorCategory = filters.doctorCategory;
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    const appointments = await this._appointmentsRepository.getAllAppointmentsAdmin(pageNumber, limitNumber, query);
    
    console.log("appointments from service...", appointments);

    return appointments;
  }

}
