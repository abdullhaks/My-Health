import { inject , injectable } from "inversify";
import IDoctorAppointmentService from "../interfaces/IDoctorAppointmentService";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import { IAppointment } from "../../../dto/appointmentDTO";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";

@injectable()
export default class DoctorAppointmentService implements IDoctorAppointmentService {

    constructor(
      @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository,
      @inject ("IUserRepository") private _userRepository : IUserRepository
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

    const {appointments,totalPages} = await this._appointmentsRepository.getAllAppointments(page, limit, query);
    console.log("Appointments from service...", appointments);

      const profile = new Map();
      const updatedAppointments = await Promise.all(
        appointments.map(async (item: any) => {
          if (profile.has(item.userId)) {
            item.profile = profile.get(item.userId);
            return item;
          } else {
            const user = await this._userRepository.findOne({ _id: item.userId });
            if (user) {
              const url = await getSignedImageURL(user.profile);
              if (url) {
                profile.set(item.userId, url);
                item.profile = url;
              }else{
                item.profile = ""
              }
            }
            return item;
          }
        })
      );

    return {appointments:updatedAppointments,totalPages};
  }


}
