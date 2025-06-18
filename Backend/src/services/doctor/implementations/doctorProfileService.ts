import IDoctorProfileService from "../interfaces/IDoctorProfileSevices";
import { Response } from "express";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import { IUser } from "../../../dto/userDTO";
import {IDoctor} from "../../../dto/doctorDTO"
import { inject, injectable } from "inversify";
import bcrypt from "bcryptjs";
import generateOtp from "../../../utils/helpers";
import { generateRandomPassword } from "../../../utils/helpers";
import nodemailer from "nodemailer";
import OtpModel from "../../../models/otpModel";
import RecoveryPasswordModel from "../../../models/recoveryPasswordModel";
import { generateOtpMail } from "../../../utils/generateOtpMail";
import dotenv from 'dotenv';
dotenv.config();
import { generateAccessToken,generateRefreshToken , verifyRefreshToken } from "../../../utils/jwt";
import { generateRecoveryPasswordMail } from "../../../utils/generateRecoveyPassword";
import { IResponseDTO } from "../../../dto/commonDTO";
import { getSignedImageURL, uploadFileToS3 } from "../../../middlewares/common/uploadS3";
import IPaymentRepository from "../../../repositories/interfaces/IPaymentRepository";

console.log("User auth service is running....");
console.log("NODE_ENV: ", process.env.EMAIL_USER);
console.log("NODE_ENV: ", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS},
});




@injectable()
export default class DoctorProfileService implements IDoctorProfileService {

    constructor(
        @inject("IDoctorRepository") private _doctorRepository:IDoctorRepository,
        @inject("IPaymentRepository") private _paymentRepository:IPaymentRepository

){

    }


    async verifySubscription (sessionId:string): Promise<any>{

        console.log("session id from verifySubscription",sessionId);

        const verification = await this._paymentRepository.findOne({sessionId:sessionId});
        if(!verification){
            throw new Error("subscription verification failed");
        };

        const doctor = await this._doctorRepository.findOne({_id:verification.doctor});

        if (!doctor) {
            throw new Error("Doctor not found in subcription verification");
        }

        if(doctor){
          doctor.profile = await getSignedImageURL(doctor.profile)
        }
        const { password, ...doctorWithoutPassword } = doctor;

        return {
          message: "subscription verification success",
          doctor: doctorWithoutPassword,
        };

    }
    


    async updateDoctorDp(userId: string, updatedFields: any, fileKey: string | undefined): Promise<any> {
      try {
        const updatePayload = {
          ...updatedFields,
          ...(fileKey && { profile: fileKey }),
        };
    
        const updatedUser = await this._doctorRepository.update(userId, updatePayload);

        if(updatedUser){
          updatedUser.profile = await getSignedImageURL(updatedUser.profile)
        }
        
        return updatedUser;
      } catch (error: any) {
        console.error("Service error:", error);
        throw new Error("Failed to update profile");
      }
    };


 async updateProfile(userId:string,userData: Partial<IDoctor> ): Promise<any> {
        
        console.log("user data is ",userData);
        console.log("user id from service ",userId);

        try {
            const updatedUser = await this._doctorRepository.update(userId.toString(), userData);
            console.log("Updated user: ", updatedUser);

            if(updatedUser){
                const { password, ...userWithoutPassword } = updatedUser.toObject();
      
                if(userWithoutPassword.profile){
                  userWithoutPassword.profile = await getSignedImageURL(userWithoutPassword.profile)
                }
            return {
            message: "updated successful",
            updatedDoctor: userWithoutPassword,
            };
           
            }

            
        } catch (error) {
            console.error("Error updating user profile:", error);
            throw new Error("Failed to update user profile");
        }
    };


}