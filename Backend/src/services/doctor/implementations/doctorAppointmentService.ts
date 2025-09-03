import { inject , injectable } from "inversify";
import IDoctorAppointmentService from "../interfaces/IDoctorAppointmentService";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IAnalyticsRepository from "../../../repositories/interfaces/IAnalyticsRepository";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";

@injectable()
export default class DoctorAppointmentService implements IDoctorAppointmentService {

    constructor(

      @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository,
      @inject ("IUserRepository") private _userRepository : IUserRepository,
      @inject("IAnalyticsRepository")private _analyticsRepository: IAnalyticsRepository,
      @inject("ITransactionRepository") private _transactionRepository: ITransactionRepository

    ){   }

async getDoctorAppointments(
    doctorId: string,
    page: number,
    limit: number,
    filters: { appointmentStatus?: string; startDate?: string; endDate?: string }
  ): Promise<{appointments:IAppointmentDTO[] | null,totalPages:number}> {
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


     const expiredAppointments = await this._appointmentsRepository.findAll({
      doctorId: doctorId,
      appointmentStatus: "booked",
      end: { $lt: new Date() }
    });

    // Then, update their status
    if (expiredAppointments && expiredAppointments.length > 0) {
      await this._appointmentsRepository.updateMany(
        { doctorId: doctorId, appointmentStatus: "booked", end: { $lt: new Date() } },
        { appointmentStatus: "cancelled", paymentStatus: "refunded" }
      );

      await Promise.all(expiredAppointments.map(async (appointment: any) => {
        await this._userRepository.update(appointment.userId, {
          $inc: { walletBalance: appointment.fee },
        });
        // Optionally update analytics here if needed
        await this._transactionRepository.create({
          from: "admin",
          to: "user",
          method: "wallet",
          amount: appointment.fee,
          paymentFor: "refund",
          userId: appointment.userId,
          doctorId: appointment.doctorId
        });
      }));
    }

    let {appointments,totalPages} = await this._appointmentsRepository.getAllAppointments(page, limit, query);
    console.log("Appointments from service...", appointments);

    if(appointments){
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

      if(updatedAppointments){
        appointments=updatedAppointments
      }

    }

    return {appointments,totalPages};
  };



    async cancelAppointment(
      appointmentId: string
    ): Promise<{
      status: boolean;
      message: string;
    }> {
      console.log("appointment id is ", appointmentId);
      const response = await this._appointmentsRepository.update(appointmentId, {
        appointmentStatus: "cancelled",
        paymentStatus: "refunded",
      });
      if (response) {
        const updateWalet = await this._userRepository.update(response.userId, {
          $inc: { walletBalance: response.fee },
        });
        const updateAnalytics =
          await this._analyticsRepository.uptadeOneWithUpsert(
            { dataSet: "1" },
            { $inc: { totalRevenue: -response.fee } }
          );
        const transaction = await this._transactionRepository.create({
          from: "admin",
          to: "user",
          method: "wallet",
          amount: response.fee,
          paymentFor: "refund",
          userId: response.userId,
          doctorId:response.doctorId
        }); 
  
        if (updateWalet) {
          return {
            status: true,
            message: `your appointment with ${updateWalet.fullName} has been cancelled `,
          };
        } else {
          return {
            message:
              "Your appointment cancletation failed, please try again later",
            status: false,
          };
        }
      }
      // Ensure a return value for all code paths
      return {
        status: false,
        message: "Appointment cancellation failed, appointment not found.",
      };
    }


}
