import IAdminAuthService from "../interfaces/IAdminAuthService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import { IAdmin } from "../../../dto/adminDTO";
import { inject, injectable } from "inversify";
import bcrypt from "bcryptjs";
import { generateRandomPassword } from "../../../utils/helpers";
import nodemailer from "nodemailer";
import RecoveryPasswordModel from "../../../models/recoveryPasswordModel";
import dotenv from 'dotenv';
dotenv.config();
import { generateAccessToken,generateRefreshToken , verifyRefreshToken } from "../../../utils/jwt";
import { Request, Response, NextFunction } from "express";
import { generateRecoveryPasswordMail } from "../../../utils/generateRecoveyPassword";
import {IResponseDTO} from "../../../dto/commonDTO";

console.log("Admin auth service is running....");
console.log("NODE_ENV: ", process.env.EMAIL_USER);
console.log("NODE_ENV: ", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS},
});




@injectable()
export default class AdminAuthService implements IAdminAuthService {

    constructor(@inject("IAdminRepository") private _adminRepository:IAdminRepository){

    }


    async login(res: Response, adminData: IAdmin): Promise<any> {
        console.log("admin data from service....", adminData);
      
        if (!adminData.email || !adminData.password) {
          throw new Error("Please provide all required fields");
        }
      
        const admin = await this._adminRepository.findByEmail(adminData.email);
        console.log("Existing user: ", admin);
      
        if (!admin) {
          throw new Error("Invalid credentials");
        }
      
        const isPasswordValid = await bcrypt.compare(adminData.password, admin.password);
        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }
      
       
      
        const accessToken = generateAccessToken({ data: admin._id });
        const refreshToken = generateRefreshToken({ data: admin._id });
      
        res.cookie("adminRefreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      
        const { password, ...userWithoutPassword } = admin.toObject();
      
        return {
          message: "Login successful",
          admin: userWithoutPassword,
          accessToken
        };
      }
      

    
    async forgotPassword(email: string): Promise<any> {
      if (!email) {
        throw new Error("Email is required");
      }
    
      const admin = await this._adminRepository.findByEmail(email);
    
      if (!admin) {
        throw new Error("Admin not found");
      }
    
     
      const recoveryPassword = generateRandomPassword(10);
      console.log("Generated recovery password:", recoveryPassword);
    
  
      const recoveryRecord = new RecoveryPasswordModel({
        email,
        recoveryPassword,
        createdAt: Date.now(),
      });
    
      await recoveryRecord.save();
    
   
      const mailOptions = generateRecoveryPasswordMail(email, recoveryPassword);

     
    
      try {
        await transporter.sendMail(mailOptions);
        return {
          message: "Recovery password sent to your email",
          email:admin.email
        };
      } catch (error) {
        console.error("Error sending recovery email:", error);
        throw new Error("Failed to send recovery email");
      }
    }
    

    async verifyRecoveryPassword(email: string, recoveryCode: string): Promise<boolean> {
      const record = await RecoveryPasswordModel.findOne({ email }).sort({ createdAt: -1 });
    
      if (!record) return false;
    
      const isMatch = record.recoveryPassword === recoveryCode;
      return isMatch;
    }
    
    async refreshToken(refreshToken: string): Promise<IResponseDTO> {

      console.log("Refresh token from service: ", refreshToken);
        if (!refreshToken) {
           throw new Error("Refresh token not found" );
        }
    
        const verified = verifyRefreshToken(refreshToken);
        if (!verified) {
           throw new Error("Invalid refresh token" );
        }
    
        const accessToken = generateAccessToken({ data: verified.data });
    
        return { accessToken };
    }
}