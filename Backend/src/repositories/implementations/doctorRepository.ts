import { injectable , inject } from "inversify";
import doctorModel from "../../models/doctorModel";
import OtpModel from "../../models/otpModel";
import { IDoctorDocument } from "../../entities/doctorEntities";
import BaseRepository from "./baseRepository";
import IDoctorRepository from "../interfaces/IDoctorRepository";

@injectable()

export default class DoctorRepository extends BaseRepository<IDoctorDocument> implements IDoctorRepository{

    constructor(
        @inject("doctorModel") private _doctorModel: any,
        @inject("otpModel") private _otpModel: any 
      
    ) {
        super(_doctorModel);
    }


    async findByEmail ( email:string):Promise<IDoctorDocument>{
            try{
    
                const doctor =await this._doctorModel.findOne({email:email});
                return doctor
    
            }catch(error){
                console.log(error);
                throw new Error("Fialed to find doctor with this email");
            }
        };
    
    
        async findLatestOtpByEmail(email: string): Promise<any> {
            try {
                const otpRecord = await this._otpModel.findOne({ email }).sort({ createdAt: -1 });
    
                if (!otpRecord) {
                    throw new Error("No OTP found for the given email");
                };
                console.log("Latest OTP record: ", otpRecord);
                return otpRecord;
            } catch (error) {
                console.error("Error fetching latest OTP:", error);
                throw new Error("Failed to fetch latest OTP for the given email");
            }
        }
        
    
        async verifyDoctor(email: string): Promise<any> {
            try {
                const result = await this._doctorModel.findOneAndUpdate(
                    { email },
                    { $set: { isVerified: true } },
                    { new: true } // returns updated document
                );
        
                if (!result) {
                    throw new Error("doctor not found for verification.");
                }
        
                console.log("doctor verified successfully:", result);
                return result;
                
            } catch (error) {
                console.error("Error verifying doctor:", error);
                throw new Error("Failed to verify doctor with this email.");
            }
        }
        

}