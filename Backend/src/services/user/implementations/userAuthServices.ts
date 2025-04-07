import IUserAuthService from "../interfaces/IUserAuthServices";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IUser } from "../../../dto/userDTO";
import { inject, injectable } from "inversify";
import bcrypt from "bcryptjs";
import generateOtp from "../../../utils/otp";
import nodemailer from "nodemailer";
import OtpModel from "../../../models/otpModel";
import { generateOtpMail } from "../../../utils/generateOtpMail";
import dotenv from 'dotenv';
dotenv.config();


const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS},
});




@injectable()
export default class UserAuthService implements IUserAuthService {

    constructor(@inject("IUserRepository") private _userRepository:IUserRepository){

    }

    async signup(userData:IUser): Promise<any> {
        console.log("user data from service....",userData);

        if(!userData.email || !userData.password || !userData.fullName){
            throw new Error("Please provide all required fields");
        }

        if(userData.password){
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        };

        const existingUser = await this._userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new Error("User already exists");
        };

        const response = await this._userRepository.create(userData);


        const otp = generateOtp();
        console.log("Generated OTP: ", otp);

        const otpResult = await this.sendMail(userData.email, otp);
        console.log("OTP sent to email: ", userData.email, otpResult);

        return response;
    };



    async sendMail(email:string,otp:string):Promise<any>{
        const otpRecord = new OtpModel({
            email: email,
            otp: otp,
            createdAt: Date.now(),
            expiresAt: Date.now() + 5 * 60 * 1000 // OTP valid for 5 minutes
        });

        otpRecord.save()


        const expirationTime = "2 minutes"; 
    
        const mailOptions = generateOtpMail(email, otp, expirationTime);
        console.log("Mail options: ", mailOptions);
        try{

            const result = await transporter.sendMail(mailOptions, (error, info) => {
                if (error) {    
                    console.log("Error sending email: ", error);
                    throw new Error("Error sending email");
                }
                console.log("Email sent: ", info.response);
            });
            console.log("Email sent successfully: ", result);

        }catch(error){
            console.log(error);
            throw new Error("Error in sending mail");
        }



    };
}