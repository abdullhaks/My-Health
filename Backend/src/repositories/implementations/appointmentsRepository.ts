import { injectable , inject } from "inversify";
import { IAppointmentDocument } from "../../entities/appointmentEntities"; 
import BaseRepository from "./baseRepository";
import IAppointmentsRepository from "../interfaces/IAppointmentsRepository";


@injectable()

export default class AppointmentsRepository extends BaseRepository<IAppointmentDocument> implements IAppointmentsRepository{

    constructor(
        @inject("appointmentModel") private _appointmentModel: any,
      
    ) {
        super(_appointmentModel);
    }


}