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
import { generateAccessToken,generateRefreshToken , verifyRefreshToken } from "../../../utils/jwt";
import { Request, Response, NextFunction } from "express";


const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS},
});




@injectable()
export default class UserAuthService implements IUserAuthService {

    constructor(@inject("IUserRepository") private _userRepository:IUserRepository){

    }


    async login(res:Response,userData:IUser):Promise<any>{
        console.log("user data from service....",userData); 
        if(!userData.email || !userData.password){
            throw new Error("Please provide all required fields");
        }

        const existingUser = await this._userRepository.findByEmail(userData.email);

        console.log("Existing user: ", existingUser);
        if (existingUser) {
            const isPasswordValid = await bcrypt.compare(userData.password, existingUser.password);
            if (!isPasswordValid) {
                throw new Error("Invalid crendentials");
            };
            console.log("User logged in successfully: ", existingUser);

            const accessToken = generateAccessToken({data:existingUser._id});
            const refreshToken = generateRefreshToken({data:existingUser._id});

            console.log("Access token: ", accessToken);
            console.log("Refresh token: ", refreshToken);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
              });

              const {password, ...userWithoutPassword} = existingUser.toObject();
         
            return { message: "Login successful", user: userWithoutPassword ,accessToken};
        } else {
            throw new Error("invalid credentials");
        }
    


    };


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

        console.log("Existing user: ", existingUser);
        if (existingUser) {
            throw new Error("User already exists");
        };

        const response = await this._userRepository.create(userData);


        const otp = generateOtp();
        console.log("Generated OTP: ", otp);

        await this.sendMail(userData.email, otp);
        console.log("OTP sent to email: ", userData.email);

        return {
            message: "Signup successful. OTP sent to email.",
            email: userData.email, // send this to frontend
          };
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

        }catch(error){
            console.log(error);
            throw new Error("Error in sending mail");
        }



    };

    async verifyOtp(email:string, otp:string):Promise<any>{
        const otpRecord = await this._userRepository.findLatestOtpByEmail(email);
        console.log("OTP record: ", otpRecord);

        if (!otpRecord) {
            throw new Error("Invalid OTP or email");
        }

        const isOtpValid = otpRecord.otp === otp;
        if (!isOtpValid) {
            throw new Error("Invalid OTP");
        }

        const validateUser = await this._userRepository.verifyUser(email);

        console.log("User verified: ", validateUser);

        return { message: "OTP verified successfully" };
    };


}