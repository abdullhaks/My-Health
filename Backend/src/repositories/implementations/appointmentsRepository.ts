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
    };


    async getUserAppointments(userId:string,page: number,limit: number): Promise<any> {
        try {
            const query: any = {userId: userId };

            const skip = (page - 1) * limit;

            const appointments = await this._appointmentModel
                .find(query)
                .skip(skip)
                .limit(limit);

                const total = await this._appointmentModel.countDocuments(query);
            return {
                appointments,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch users");
        }
    };


}