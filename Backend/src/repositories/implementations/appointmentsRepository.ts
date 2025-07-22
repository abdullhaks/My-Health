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


    async getAppointments(page: number,limit: number): Promise<any> {
        try {
            const query: any = {};

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


    async getAllAppointments(page: number, limit: number, query: any = {}): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const appointments = await await this._appointmentModel.find(query)
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email") // Assuming userId references a User model with name and email
        .populate("doctorId", "name category") // Assuming doctorId references a Doctor model with name and category
        .lean();

      const total = await  this._appointmentModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        appointments: appointments.map((appointment:any) => ({
          _id: appointment._id.toString(),
          userId: appointment.userId.toString(),
          userName: appointment.userName,
          userEmail: appointment.userEmail,
          doctorId: appointment.doctorId.toString(),
          doctorName: appointment.doctorName,
          doctorCategory: appointment.doctorCategory,
          date: appointment.date,
          start: appointment.start,
          end: appointment.end,
          duration: appointment.duration,
          fee: appointment.fee,
          paymentStatus: appointment.paymentStatus,
          paymentType: appointment.paymentType,
          appointmentStatus: appointment.appointmentStatus,
          callStartTime: appointment.callStartTime,
          createdAt: appointment.createdAt,
          updatedAt: appointment.updatedAt,
          slotId: appointment.slotId,
        })),
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching appointments:", err);
      throw new Error("Failed to fetch appointments");
    }
  }


}