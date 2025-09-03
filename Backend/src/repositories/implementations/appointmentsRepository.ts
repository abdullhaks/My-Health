import { injectable, inject } from "inversify";
import { IAppointmentDocument } from "../../entities/appointmentEntities";
import BaseRepository from "./baseRepository";
import IAppointmentsRepository from "../interfaces/IAppointmentsRepository";
import { Model } from "mongoose";
import { FilterQuery } from "mongoose";
import { IAppointment } from "../../dto/appointmentDTO";
import { IAppointmentDTO } from "../../dto/appointmentDTO";

@injectable()
export default class AppointmentsRepository
  extends BaseRepository<IAppointmentDocument>
  implements IAppointmentsRepository
{
  constructor(@inject("appointmentModel") private _appointmentModel: Model<IAppointmentDocument>) {
    super(_appointmentModel);
  }

  async getUserAppointments(
    userId: string,
    page: number,
    limit: number
  ): Promise<{appointments:IAppointment[] | null,totalPages:number | null}> {
    try {
      const query: FilterQuery<IAppointment> = { userId: userId };

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
  }

  async getAppointments(page: number, limit: number): Promise<{appointments:IAppointment[] | null,totalPages:number | null}> {
    try {
      const query: FilterQuery<IAppointment>  = {};

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
  }

  async getAllAppointments(
    page: number,
    limit: number,
    query: FilterQuery<IAppointment>  = {}
  ): Promise<{appointments:IAppointmentDTO[] ,totalPages:number}> {
    try {
      const skip = (page - 1) * limit;
      const appointments = await this._appointmentModel
        .find(query)
        .sort({ start: 1 }) // Sort by start time ascending
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("doctorId", "name category")
        .lean();

      const total = await this._appointmentModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        appointments: appointments.map((appointment) => ({
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
  };


   async getAllAppointmentsAdmin(
    page: number,
    limit: number,
    query: FilterQuery<IAppointment> = {}
  ): Promise<{appointments:IAppointmentDTO[] | null,totalPages:number | null}> {
    try {
      const skip = (page - 1) * limit;
      const appointments = await this._appointmentModel
        .find(query)
        .sort({ createdAt: -1 }) // Sort by start time ascending
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("doctorId", "name category")
        .lean();

      const total = await this._appointmentModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        appointments: appointments.map((appointment) => ({
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
  };


  
}
