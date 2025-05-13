import BaseRepository from "../implementations/baseRepository";
import { IDoctorDocument } from "../../entities/doctorEntities";


export default interface IAppointmentRepository extends BaseRepository<IDoctorDocument>{

    fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<any> 

}