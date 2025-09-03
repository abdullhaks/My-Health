import { injectable , inject } from "inversify";
import { IOtpDocument } from "../../models/otp"; 
import BaseRepository from "./baseRepository";
import IOtpRepository from "../interfaces/IOtpRepository";

@injectable()

export default class OtpRepository extends BaseRepository<IOtpDocument> implements IOtpRepository {

 constructor(
        @inject("otpModel") private _otpModel:any
    ){

        super(_otpModel)

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

}