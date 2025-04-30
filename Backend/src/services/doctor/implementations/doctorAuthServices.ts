import IDoctorAuthService from "../interfaces/IDoctorAuthServices";
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

console.log("User auth service is running....");
console.log("NODE_ENV: ", process.env.EMAIL_USER);
console.log("NODE_ENV: ", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS},
});




@injectable()
export default class DoctorAuthService implements IDoctorAuthService {

    constructor(@inject("IDoctorRepository") private _doctorRepository:IDoctorRepository){

    }


    async login (res:Response ,doctorData: Partial<IDoctor>): Promise<any> {
        console.log("user data from service....", doctorData);
      
        if (!doctorData.email || !doctorData.password) {
          throw new Error("Please provide all required fields");
        }
      
        const existingUser = await this._doctorRepository.findOne({email:doctorData.email});
        console.log("Existing user: ", existingUser);
      
        if (!existingUser) {
          throw new Error("Invalid credentials");
        }
      
        const isPasswordValid = await bcrypt.compare(doctorData.password, existingUser.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
      
        if (existingUser.isBlocked) {
          return {
            user: { email: existingUser.email, isBlocked: true },
            message: "User is blocked"
          };
        };


      
        if (!existingUser.isVerified) {
          const otp = generateOtp();
          await this.sendMail(existingUser.email, otp);
          console.log("OTP sent to email: ", existingUser.email);
      
          return {
            user: { email: existingUser.email, isVerified: false },
            message: "User not verified, OTP sent"
          };
        }
       
        const accessToken = generateAccessToken({ id: existingUser._id.toString(), role: "user" });
        const refreshToken = generateRefreshToken({ id: existingUser._id.toString(), role: "user" });
      
        res.cookie("userRefreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: false, 
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        
        res.cookie("userAccessToken", accessToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: false, 
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }); 
      
        const { password, ...userWithoutPassword } = existingUser.toObject();
      
        if(userWithoutPassword.profile){
        userWithoutPassword.profile = await getSignedImageURL(userWithoutPassword.profile)
        };

        return {
          message: "Login successful",
          user: userWithoutPassword,
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



              async signup(doctor:Partial<IDoctor>,certificates:any,parsedSpecializations:any): Promise<any> {
                  console.log("user data from service....",doctor);
          
                  const existingUser = await this._doctorRepository.findOne({email:doctor.email});
          
                  console.log("Existing user: ", existingUser);
                  if (existingUser) {
                      throw new Error("User already exists");
                  };

                  const graduationCertUrl = await uploadFileToS3(
                    certificates.graduationCertificate.buffer,
                    certificates.graduationCertificate.originalname,
                    "doctors/graduation-certificates",
                    certificates.graduationCertificate.mimetype
                  );
              
                  const registrationCertUrl = await uploadFileToS3(
                    certificates.registrationCertificate.buffer,
                    certificates.registrationCertificate.originalname,
                    "doctors/registration-certificates",
                    certificates.registrationCertificate.mimetype
                  );
              
                  const verificationIdUrl = await uploadFileToS3(
                    certificates.verificationId.buffer,
                    certificates.verificationId.originalname,
                    "doctors/verification-Ids",
                    certificates.verificationId.mimetype
                  );
              
                  
          
                  if(doctor.password){
                      const salt = await bcrypt.genSalt(10);
                      doctor.password = await bcrypt.hash(doctor.password, salt);
                  };

                  const newDoctor = {
                    fullName: doctor.fullName,
                    email: doctor.email,
                    password: doctor.password, 
                    graduation: doctor.graduation,
                    graduationCertificate: graduationCertUrl,
                    category: doctor.category,
                    registerNo: doctor.registerNo,
                    registrationCertificate: registrationCertUrl,
                    experience: doctor.experience,
                    verificationId: verificationIdUrl,
                  };
          
                  
          
                  const response = await this._doctorRepository.create(newDoctor);
                  
                  console.log("doctor response from service is ",response);
          
                  const otp = generateOtp();
                  console.log("Generated OTP: ", otp);
          
                  if (!doctor.email) {
                      throw new Error("Doctor email is required");
                  }
                  await this.sendMail(doctor.email, otp);
                  console.log("OTP sent to email: ", doctor.email);
          
                  return {
                      message: "Signup successful. OTP sent to email.",
                      email: doctor.email, 
                    };
              };

}