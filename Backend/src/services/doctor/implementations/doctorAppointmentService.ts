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

async getDoctorAppointments(
    doctorId: string,
    page: number,
    limit: number,
    filters: { appointmentStatus?: string; startDate?: string; endDate?: string }
  ): Promise<{ appointments: IAppointment[]; totalPages: number }> {
    console.log("Doctor ID from service...", doctorId);

    const query: any = { doctorId };
    if (filters.appointmentStatus) {
      query.appointmentStatus = filters.appointmentStatus;
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    const appointments = await this._appointmentsRepository.getAllAppointments(page, limit, query);
    console.log("Appointments from service...", appointments);

    return appointments;
  }


}
