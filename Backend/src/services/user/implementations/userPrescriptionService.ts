import IPrescriptionRepository from "../../../repositories/interfaces/IPrescriptionRepositiory";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IUserPrescriptionService from "../interfaces/IUserPrescriptionService";
import {inject , injectable} from "inversify"

@injectable()
export default class UserPrescriptionService implements IUserPrescriptionService {

    constructor(
        @inject("IPrescriptionRepository") private _prescriptionRepository : IPrescriptionRepository,
        @inject("IDoctorRepository") private _doctorRepository : IDoctorRepository,
        @inject("IUserRepository") private _userRepository : IUserRepository,
    ){}


    async getPrescription(appointmentId: string):Promise<any> {
        
        console.log("appointmentId is.....",appointmentId);

        let prescription = await this._prescriptionRepository.findOne({appointmentId:appointmentId});

        console.log("prescription is ....",prescription);
        if(prescription){
            var user = await this._userRepository.findOne({_id:prescription.userId});
            var doctor = await this._doctorRepository.findOne({_id:prescription.doctorId});

        console.log("user is ....",user);
        console.log("doctor is ....",doctor);

            
            return {
                prescription,
                user:{fullName:user?.fullName,
                    dob:user?.dob},
                doctor:{
                    fullName:doctor?.fullName, 
                    graduation:doctor?.graduation, 
                    category:doctor?.category, 
                    registerNo:doctor?.registerNo}
            }
        }else{
            throw new Error("fetching prescription failed")
        }
        
    }


    async getLatestPrescription(userId: string):Promise<any> {
        
        console.log("userId is.....",userId);

        let prescription = await this._prescriptionRepository.findOne({userId:userId},{sort:{createdAt:-1}});

        console.log("prescription is ....",prescription);
         return  prescription || null

      
    }




    
}