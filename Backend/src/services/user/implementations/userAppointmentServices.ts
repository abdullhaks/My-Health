import { inject , injectable } from "inversify";
import IUserAppointmentService from "../interfaces/IUserAppointmentServices";
import IAppointmentRepository from "../../../repositories/interfaces/IAppointmentRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import { IAppointment } from "../../../dto/appointmentDTO";
import { IUser } from "../../../dto/userDTO";
import {IDoctor} from "../../../dto/doctorDTO";

@injectable()
export default class UserAppointmentService implements IUserAppointmentService {

    constructor(
      @inject("IAppointmentRepository") private _appointmentRepository:IAppointmentRepository ,
      @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository,
      @inject("IUserRepository") private _userRepository:IUserRepository,
      @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository
    ){


    }

    async fetchingDoctors(
  search: string,
  location: string,
  category: string,
  sort: string,
  page: number,
  limit: number
): Promise<{ doctors: IDoctor[] }> {
  const doctors =  await this._appointmentRepository.fetchingDoctors(search, location, category, sort, page, limit);
  
  
  if (doctors.doctors.length > 0) {
    const result = await Promise.all(
      doctors.doctors.map(async (doctor: IDoctor) => {
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


async getUserAppointments(userId:string,pageNumber:number, limitNumber:number):Promise<IAppointment[]>{
  console.log("userid from service...",userId);

  const appointments = await this._appointmentsRepository.getUserAppointments(userId,pageNumber,limitNumber);
  console.log("appointments from service...",appointments);


  return appointments;

};


async cancelAppointment(appointmentId:string):Promise<{status:boolean;message:string;updatedUser:Partial<IUser>}>{
  console.log("appointment id is ",appointmentId);
  const response = await this._appointmentsRepository.update(appointmentId,{appointmentStatus:"cancelled",paymentStatus:"refunded"});
  if(response){
    const updateWalet = await this._userRepository.update(response.userId, {$inc:{walletBalance: response.fee}});

            if(updateWalet){
                  const { password, ...userWithoutPassword } = updateWalet.toObject();
                  if(userWithoutPassword.profile){
                    userWithoutPassword.profile = await getSignedImageURL(userWithoutPassword.profile)
                  };
                  return {status:true,message:`${updateWalet.fullName} your appointment has been cancelled and ${response.fee} has been refunded to your wallet`,updatedUser:userWithoutPassword};
            }else{
                 return {message:"Your appointment cancletation failed, please try again later",status:false, updatedUser: {}};
                };

  }
  // Ensure a return value for all code paths
  return { status: false, message: "Appointment cancellation failed, appointment not found.", updatedUser: {} };
};


async walletPayment(data:Partial<IAppointment>):Promise<IAppointment> {

console.log("data is ",data);
const doctor = await this._doctorRepository.findOne({_id:data.doctorId});
console.log("doctor is ....",doctor);
if(!doctor){
  throw new Error("Wallet payment failed")
};


if (!data.userId) {
  throw new Error("User ID is required for wallet payment");
}
if (typeof data.fee !== "number") {
  throw new Error("Fee is required for wallet payment");
}
const userUpdate = await this._userRepository.update(data.userId, { $inc: { walletBalance: -data.fee } });

console.log("updated user is ......",userUpdate);

    data.doctorName= doctor?.fullName;
    data.doctorCategory= doctor?.category;
    const appointment = await this._appointmentsRepository.create(data);
    console.log("Appointment created:", appointment);

    return appointment;
    
};
};
