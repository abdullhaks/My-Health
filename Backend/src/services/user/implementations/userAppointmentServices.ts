import { inject , injectable } from "inversify";
import IUserAppointmentService from "../interfaces/IUserAppointmentServices";
import IAppointmentRepository from "../../../repositories/interfaces/IAppointmentRepository";

@injectable()
export default class UserAppointmentService implements IUserAppointmentService {

    constructor(@inject("IAppointmentRepository") private _appointmentRepository:IAppointmentRepository ){


    }

    async fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<any> {
  return await this._appointmentRepository.fetchingDoctors(search, location, category, sort, page, limit);
}


}