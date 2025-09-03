import { inject, injectable } from "inversify";
import IAdminDoctorService from "../interfaces/IAdminDoctorService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { generateDeclineMail } from "../../../utils/generateSignupDeclineMail";
import {IDoctor} from "../../../dto/doctorDTO"


dotenv.config();


const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});



@injectable()
export default class AdminDoctorService implements IAdminDoctorService {
  constructor(
    @inject("IAdminRepository") private _adminRepository: IAdminRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository
  ) {}

  async getDoctors(
    page: number,
    search: string | undefined,
    limit: number
    ,onlyPremium:boolean
  ): Promise<{doctors:IDoctor[]|null,totalPages:number}> {
    const response = await this._doctorRepository.getDoctors(
      page,
      search,
      limit,
      onlyPremium
    );

    if (!response) {
      throw new Error("doctors not found..!");
    }

    return response;
  }

  async getDoctor(id: string): Promise<IDoctor> {
    const response = await this._doctorRepository.getDoctor(id);
    if (!response) {
      throw new Error("doctor not found..!");
    }

    const { password, ...userWithoutPassword } = response.toObject();
            if (userWithoutPassword.profile) {
              userWithoutPassword.profile = await getSignedImageURL(response.profile);
            }
    return userWithoutPassword;
  }

  async verifyDoctor(id: string): Promise<IDoctor> {
    const response = await this._doctorRepository.verifyDoctor(id);

    if (!response) {
      throw new Error("doctor verifying failed");
    }
    return response;
  }

   async declineDoctor(id: string, reason: string): Promise<IDoctor> {
    const response = await this._doctorRepository.declineDoctor(id, reason);

    if (!response) {
      throw new Error("doctor declining failed");
    }

    // Send decline email
    try {
      const doctor = await this._doctorRepository.getDoctor(id);
      if (doctor && doctor.email) {
        const mailOptions = generateDeclineMail(doctor.email, reason);
        await transporter.sendMail(mailOptions);
      }
    } catch (error) {
      console.error("Error sending decline email:", error);
      // Don't throw error to avoid failing the decline process
    }

    return response;
  };



  async block(id: string): Promise<IDoctor| null> {
    console.log("id from block....", id);
    const response = await this._doctorRepository.blockDoctor(id);

    console.log("blocked result is ", response);

    return response;
  }

  async unblock(id: string): Promise<IDoctor| null> {
    console.log("id from block....", id);
    const response = await this._doctorRepository.unblockDoctor(id);

    console.log("blocked result is ", response);

    return response;
  }
}