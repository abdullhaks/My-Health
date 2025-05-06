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
        console.log("doctor data from service....", doctorData);
      
        if (!doctorData.email || !doctorData.password) {
          throw new Error("Please provide all required fields");
        }
      
        const existingDoctor = await this._doctorRepository.findOne({email:doctorData.email});
        console.log("Existing doctor: ", existingDoctor);
      
        if (!existingDoctor) {
          throw new Error("Invalid credentials");
        }
      
        const isPasswordValid = await bcrypt.compare(doctorData.password, existingDoctor.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
      
        if (existingDoctor.isBlocked) {
          return {
            doctor: existingDoctor,
            message: "doctor is blocked"
          };
        };


      
        if (!existingDoctor.isVerified) {
          const otp = generateOtp();
          await this.sendMail(existingDoctor.email, otp);
          console.log("OTP sent to email: ", existingDoctor.email);
      
          return {
            doctor: existingDoctor,
            message: "doctor not verified, OTP sent"
          };
        };


        if (existingDoctor.adminVerified==0 || existingDoctor.adminVerified==3) {
          return {
            doctor: existingDoctor,
            message: "doctor credential not verified"
          };
        };
       
        const accessToken = generateAccessToken({ id: existingDoctor._id.toString(), role: "doctor" });
        const refreshToken = generateRefreshToken({ id: existingDoctor._id.toString(), role: "doctor" });
      
        res.cookie("doctorRefreshToken", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: false, 
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        
        res.cookie("doctorAccessToken", accessToken, {
          httpOnly: true,
          sameSite: "strict",
          secure: false, 
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }); 
      
        const { password, ...doctorWithoutPassword } = existingDoctor.toObject();
      
        if(doctorWithoutPassword.profile){
        doctorWithoutPassword.profile = await getSignedImageURL(doctorWithoutPassword.profile)
        };

        return {
          message: "Login successful",
          doctor: doctorWithoutPassword,
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


              async verifyOtp(email:string, otp:string):Promise<any>{
                      const otpRecord = await this._doctorRepository.findLatestOtpByEmail(email);
                      console.log("OTP record: ", otpRecord);
              
                      if (!otpRecord) {
                          throw new Error("Invalid OTP or email");
                      }
              
                      const isOtpValid = otpRecord.otp === otp;
                      if (!isOtpValid) {
                          throw new Error("Invalid OTP");
                      }
              
                      const validateUser = await this._doctorRepository.verifyDoctor(email);
              
                      console.log("User verified: ", validateUser);
              
                      return { message: "OTP verified successfully" };
                  };
              
              
              
                  async resentOtp(email: string): Promise<any> {
                    if (!email) {
                      throw new Error("Email is required");
                    }
                  
                    const user = await this._doctorRepository.findByEmail(email);
                    if (!user) {
                      throw new Error("User not found");
                    }
                  
                    if (user.isVerified) {
                      throw new Error("User is already verified");
                    }
                  
                    const otp = generateOtp();
                  
                    // Save OTP to DB
                    const otpRecord = new OtpModel({
                      email,
                      otp,
                      createdAt: Date.now(),
                      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
                    });
                  
                    await otpRecord.save();
                  
                    // Send OTP email
                    const expirationTime = "2 minutes";
                    const mailOptions = generateOtpMail(email, otp, expirationTime);
                  
                    try {
                      await transporter.sendMail(mailOptions);
                      return { message: "OTP resent to your email" };
                    } catch (err) {
                      console.error("Error sending OTP:", err);
                      throw new Error("Failed to send OTP");
                    }
                  }

}