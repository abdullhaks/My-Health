import { inject , injectable } from "inversify";
import IDoctorAppointmentService from "../interfaces/IDoctorAppointmentService";
import IAppointmentRepository from "../../../repositories/interfaces/IAppointmentRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import { IAppointment } from "../../../dto/appointmentDTO";

@injectable()
export default class DoctorAppointmentService implements IDoctorAppointmentService {

    constructor(
      @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository
    ){   }

async getDoctorAppointments(doctorId:string):Promise<IAppointment[]>{
  console.log("userid from service...",doctorId);

  const appointments = await this._appointmentsRepository.findAll({doctorId:doctorId});
  console.log("appointments from service...",appointments);


  return appointments;

}


}
