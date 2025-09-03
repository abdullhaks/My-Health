import IDoctorAuthService from "../interfaces/IDoctorAuthServices";
import { Response } from "express";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IOtpRepository from "../../../repositories/interfaces/IOtpRepository";
import { IUser } from "../../../dto/userDTO";
import { inject, injectable } from "inversify";
import bcrypt from "bcryptjs";
import generateOtp from "../../../utils/helpers";
import { generateRandomPassword } from "../../../utils/helpers";
import nodemailer from "nodemailer";
import OtpModel from "../../../models/otp";
import RecoveryPasswordModel from "../../../models/recoveryPassword";
import { generateOtpMail } from "../../../utils/generateOtpMail";
import dotenv from "dotenv";
import {generateAccessToken,generateRefreshToken,verifyRefreshToken,} from "../../../utils/jwt";
import { generateRecoveryPasswordMail } from "../../../utils/generateRecoveyPassword";
import { IResponseDTO } from "../../../dto/commonDTO";
import {getSignedImageURL,uploadFileToS3,} from "../../../middlewares/common/uploadS3";
import { IDoctor } from "../../../dto/doctorDTO";

dotenv.config();


const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});



interface IParsed {
  title?:string;
  certificate?:{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    };
}

  interface ICertificates {
    graduationCertificate: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    };
    registrationCertificate: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    };
    verificationId: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    };
  }

@injectable()
export default class DoctorAuthService implements IDoctorAuthService {
  constructor(
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,
    @inject("IOtpRepository") private _otpRepository: IOtpRepository
  ) {}

  async login(res: Response, doctorData: Partial<IDoctor>): Promise<{message:string,doctor:IDoctor,accessToken?:string,refreshToken?:string}> {
    console.log("doctor data from service....", doctorData);

    if (!doctorData.email || !doctorData.password) {
      throw new Error("Please provide all required fields");
    }

    const existingDoctor = await this._doctorRepository.findOne({
      email: doctorData.email,
    });
    console.log("Existing doctor: ", existingDoctor);

    if (!existingDoctor) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      doctorData.password,
      existingDoctor.password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    if (existingDoctor.isBlocked) {
      return {
        doctor: existingDoctor,
        message: "doctor is blocked",
      };
    }

    if (!existingDoctor.isVerified) {
      const otp = generateOtp();
      await this.sendMail(existingDoctor.email, otp);
      console.log("OTP sent to email: ", existingDoctor.email);

      return {
        doctor: existingDoctor,
        message: "doctor not verified, OTP sent",
      };
    }

    if (
      existingDoctor.adminVerified == 0 ) {

      return {
        doctor: existingDoctor,
        message: `doctor credential not verified.`,
      };
    }

    if (existingDoctor.adminVerified == 3) {

      await this._doctorRepository.delete(existingDoctor._id.toString());

      return {
        doctor: existingDoctor,
        message: `doctor credential not verified.${existingDoctor.rejectionReason}`,
      };
    }

    const accessToken = generateAccessToken({
      id: existingDoctor._id.toString(),
      role: "doctor",
    });
    const refreshToken = generateRefreshToken({
      id: existingDoctor._id.toString(),
      role: "doctor",
    });

    // res.cookie("doctorRefreshToken", refreshToken, {
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: false,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    // res.cookie("doctorAccessToken", accessToken, {
    //   httpOnly: true,
    //   sameSite: "strict",
    //   secure: false,
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });

    const { password, ...doctorWithoutPassword } = existingDoctor.toObject();

    if (doctorWithoutPassword.profile) {
      doctorWithoutPassword.profile = await getSignedImageURL(
        doctorWithoutPassword.profile
      );
    }

    return {
      message: "Login successful",
      doctor: doctorWithoutPassword,
      accessToken,
      refreshToken,
    };
  }




async sendMail(email: string, otp: string): Promise<void> {

  console.log("sending otp......")
    const otpRecord = new OtpModel({
        email,
        otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000
    });
    await otpRecord.save();

    const expirationTime = "2 minutes";
    const mailOptions = generateOtpMail(email, otp, expirationTime);
    await transporter.sendMail(mailOptions);
}



  async signup(
    doctor: Partial<IDoctor>,
    certificates: ICertificates,
    parsedSpecializations: IParsed[]
  ): Promise<{message:string,email:string}> {
    console.log("user data from service....", doctor);

    const existingUser = await this._doctorRepository.findOne({
      email: doctor.email,
    });

    console.log("Existing user: ", existingUser);
    if (existingUser) {
      throw new Error("User already exists");
    }

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

    if (doctor.password) {
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(doctor.password, salt);
    }

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

    console.log("doctor response from service is ", response);

    // const otp = generateOtp();

    if (!doctor.email) {
      throw new Error("Doctor email is required");
    }
    // await this.sendMail(doctor.email, otp);

    return {
      message: "Signup successful. OTP sent to email.",
      email: doctor.email,
    };
  }



  async verifyOtp(email: string, otp: string): Promise<{message:string}> {
    const otpRecord = await this._otpRepository.findLatestOtpByEmail(email);
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
  }






  async resentOtp(email: string): Promise<{message:string}> {
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


  async refreshToken(refreshToken: string): Promise<IResponseDTO> {
      
            // console.log("Refresh token from service: ", refreshToken);
              if (!refreshToken) {
                 throw new Error("refresh token not found" );
              }
          
              const verified = verifyRefreshToken(refreshToken);
  
              // console.log("is verified from refresh token auth service...",verified);
  
              if (!verified) {
                 throw new Error("Invalid refresh token" );
              }
          
              // console.log("verified is ", verified);
              const accessToken = generateAccessToken({ id: verified.id, role: verified.role });
  
              // console.log("new access token is ...............",accessToken);
          
              return {accessToken} ;
          };

}
