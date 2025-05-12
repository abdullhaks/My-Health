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
        const { password, ...doctorWithoutPassword } = doctor;

        return {
          message: "subscription verification success",
          doctor: doctorWithoutPassword,
        };

    }
    



}