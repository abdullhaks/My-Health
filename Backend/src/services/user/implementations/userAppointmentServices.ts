import { inject , injectable } from "inversify";
import IUserAppointmentService from "../interfaces/IUserAppointmentServices";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IAnalyticsRepository from "../../../repositories/interfaces/IAnalyticsRepository";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import { IAppointment, IAppointmentDTO } from "../../../dto/appointmentDTO";
import { IUser } from "../../../dto/userDTO";
import {IDoctor} from "../../../dto/doctorDTO";
import appointmentModel from "../../../models/appointment";

@injectable()
export default class UserAppointmentService implements IUserAppointmentService {
  constructor(
 
    @inject("IAppointmentsRepository")
    private _appointmentsRepository: IAppointmentsRepository,
    @inject("IUserRepository") private _userRepository: IUserRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,
    @inject("IAnalyticsRepository")
    private _analyticsRepository: IAnalyticsRepository,
    @inject("ITransactionRepository")
    private _transactionRepository: ITransactionRepository
  ) {}

  async fetchingDoctors(
    search: string,
    location: string,
    category: string,
    sort: string,
    page: number,
    limit: number
  ): Promise<{doctors:IDoctor[] | null ,
              total:number,
              page:number,
              totalPages:number}> {
    const response = await this._doctorRepository.fetchingDoctors(
      search,
      location,
      category,
      sort,
      page,
      limit
    );

    if (response.doctors && response.doctors.length > 0) {
      const result = await Promise.all(
        response.doctors.map(async (doctor: IDoctor) => {
          const { password, ...userWithoutPassword } = doctor.toObject();
          if (userWithoutPassword.profile) {
            userWithoutPassword.profile = await getSignedImageURL(
              doctor.profile
            );
          }
          return userWithoutPassword;
        })
      );
    
      console.log("doctors list from backend.......", result);

     
      response.doctors = result;

    }

      return response;
   
  }



  async getUserAppointments(
    userId: string,
    page: number,
    limit: number,
    filters: { appointmentStatus?: string; startDate?: string; endDate?: string }
  ): Promise<{ appointments: IAppointmentDTO[]|null; totalPages: number }> {
    console.log("userid from service...", userId);

    const query: any = { userId };
    if (filters.appointmentStatus) {
      query.appointmentStatus = filters.appointmentStatus;
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: filters.startDate,
        $lte: filters.endDate,
      };
    }

    // First, find expired appointments
    const expiredAppointments = await this._appointmentsRepository.findAll({
      userId: userId,
      appointmentStatus: "booked",
      end: { $lt: new Date() }
    });

    // Then, update their status
    if (expiredAppointments && expiredAppointments.length > 0) {
      await this._appointmentsRepository.updateMany(
        { userId: userId, appointmentStatus: "booked", end: { $lt: new Date() } },
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


    if(appointments){
    const profile = new Map();
  const updatedAppointments = await Promise.all(
    appointments.map(async (item: any) => {
      if (profile.has(item.doctorId)) {
        item.profile = profile.get(item.doctorId);
        return item;
      } else {
        const doctor = await this._doctorRepository.findOne({ _id: item.doctorId });
        if (doctor) {
          const url = await getSignedImageURL(doctor.profile);
          if (url) {
            profile.set(item.doctorId, url);
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
    appointments = updatedAppointments
  }

    };


    return {appointments,totalPages};
  }
 
  async cancelAppointment(
    appointmentId: string 
  ): Promise<{
    status: boolean;
    message: string;
    updatedUser: Partial<IUser>;
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
        const { password, ...userWithoutPassword } = updateWalet.toObject();
        if (userWithoutPassword.profile) {
          userWithoutPassword.profile = await getSignedImageURL(
            userWithoutPassword.profile
          );
        }
        return {
          status: true,
          message: `${updateWalet.fullName} your appointment has been cancelled and ${response.fee} has been refunded to your wallet`,
          updatedUser: userWithoutPassword,
        };
      } else {
        return {
          message:
            "Your appointment cancletation failed, please try again later",
          status: false,
          updatedUser: {},
        };
      }
    }
    // Ensure a return value for all code paths
    return {
      status: false,
      message: "Appointment cancellation failed, appointment not found.",
      updatedUser: {},
    };
  }

  async walletPayment(data: Partial<IAppointment>): Promise<IAppointment> {
    console.log("data is ", data);
    const doctor = await this._doctorRepository.findOne({ _id: data.doctorId });
    console.log("doctor is ....", doctor);
    if (!doctor) {
      throw new Error("Wallet payment failed");
    }

    if (!data.userId) {
      throw new Error("User ID is required for wallet payment");
    }
    if (typeof data.fee !== "number") {
      throw new Error("Fee is required for wallet payment");
    }

    // Generate a unique transactionId for wallet payment
    let transactionId = `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const userUpdate = await this._userRepository.update(data.userId, {
      $inc: { walletBalance: -data.fee },
    });
    const updateAnalytics = await this._analyticsRepository.uptadeOneWithUpsert(
      { dataSet: "1" },
      { $inc: { totalRevenue: data.fee } }
    );
    const transaction = await this._transactionRepository.create({
      from: "user",
      to: "admin",
      method: "wallet",
      amount: data.fee,
      paymentFor: "appointment",
      userId: userUpdate?._id.toString(),
      doctorId: data.doctorId,
      transactionId
    });

    console.log("updated user is ......", userUpdate);

    data.doctorName = doctor?.fullName;
    data.doctorCategory = doctor?.category;
    data.transactionId = transactionId;
    const appointment = await this._appointmentsRepository.create(data);
    console.log("Appointment created:", appointment);

    return appointment;
  };



async activeBooking(userId: string, doctorId: string): Promise<{ status: boolean; }> {
  
 

  const existingAppointment = await appointmentModel.findOne({
    userId: userId,
    doctorId: doctorId,
    appointmentStatus: "booked",
  });

  if (existingAppointment) {
    return { status: true };
  } else {
    return { status: false };
  }
}












};
