import { inject , injectable } from "inversify";
import IUserAppointmentService from "../interfaces/IUserAppointmentServices";
import IAppointmentRepository from "../../../repositories/interfaces/IAppointmentRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";

@injectable()
export default class UserAppointmentService implements IUserAppointmentService {

    constructor(
      @inject("IAppointmentRepository") private _appointmentRepository:IAppointmentRepository ,
      @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository
    ){


    }

    async fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<any> {
  const doctors =  await this._appointmentRepository.fetchingDoctors(search, location, category, sort, page, limit);
  
  
  if (doctors.doctors.length > 0) {
    const result = await Promise.all(
      doctors.doctors.map(async (doctor: any) => {
        const { password, ...userWithoutPassword } = doctor.toObject();
        if (userWithoutPassword.profile) {
          userWithoutPassword.profile = await getSignedImageURL(doctor.profile);
        }
        return userWithoutPassword;
      })
    );

    console.log("doctors list from backend.......", result);
    return {doctors: result };

}

return {doctors:[]}
}


async getUserAppointments(userId:string):Promise<any>{
  console.log("userid from service...",userId);

  const appointments = await this._appointmentsRepository.findAll({userId:userId});
  console.log("appointments from service...",appointments);


  return appointments;

}


}
