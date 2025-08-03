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

       async fetchingDoctors(
        search: string,
        location: string,
        category: string,
        sort: string,
        page: number,
        limit: number
        ): Promise<any> {
        try {
            const query: any = {
            isBlocked: false,
            isVerified: true,
            adminVerified:1,
            };

            if (search) {
            query.fullName = { $regex: search, $options: "i" };
            }
            if (location) {
            query["location.text"] = { $regex: location, $options: "i" };
            }
            if (category) {
            query.category = { $regex: category, $options: "i" };
            }

            let sortOption: any = {};
            if (sort === "experience") {
            sortOption.experience = -1;
            } else if (sort === "alphabet") {
            sortOption.fullName = 1;
            }

            const skip = (page - 1) * limit;

            const [doctors, total] = await Promise.all([
            this._doctorModel.find(query).sort(sortOption).skip(skip).limit(limit),
            this._doctorModel.countDocuments(query)
            ]);

            return {
            doctors,
            total,
            page,
            totalPages: Math.ceil(total / limit)
            };
        } catch (err) {
            console.error("Error in repository fetchingDoctors:", err);
            throw err;
        }
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
        };


         async aggregate(pipeline: any[]): Promise<any> {
            try {
                const resp = await this._doctorModel.aggregate(pipeline);
                console.log("pipe line is .....",pipeline)
                console.log("resp is .....",resp)
            return resp;

            } catch (error) {
            console.error("Error in aggregate:", error);
            throw new Error("Failed to perform aggregation");
            }
        }
        

}