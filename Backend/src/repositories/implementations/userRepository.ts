import { injectable , inject } from "inversify";
import userModel from "../../models/userModel";
import OtpModel from "../../models/otpModel";
import { IUserDocument } from "../../entities/userEntities";
import BaseRepository from "./baseRepository";
import IUserRepository from "../interfaces/IUserRepository";
import { UpdateQuery } from "mongoose";

@injectable()

export default class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository{

    constructor(
        @inject("userModel") private _userModel: any,
        @inject("otpModel") private _otpModel: any 
    ) {
        super(_userModel);
    }

    async findByEmail ( email:string):Promise<IUserDocument>{
        try{

            const user =await this._userModel.findOne({email:email});
            return user

        }catch(error){
            console.log(error);
            throw new Error("Fialed to find user with this email");
        }
    };


    async create(userData : IUserDocument):Promise<IUserDocument>{


        try{
            
        const user = await this._userModel.create(userData);
        return user;

        }catch(error){
            console.log(error);
            console.error("error in saving user data");
            throw new Error("Error in saving user data ");

        }

    }


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
    

    async verifyUser(email: string): Promise<any> {
        try {
            const result = await this._userModel.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true } // returns updated document
            );
    
            if (!result) {
                throw new Error("User not found for verification.");
            }
    
            console.log("User verified successfully:", result);
            return result;
            
        } catch (error) {
            console.error("Error verifying user:", error);
            throw new Error("Failed to verify user with this email.");
        }
    }
    


}