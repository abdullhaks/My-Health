import {inject,injectable} from "inversify"
import IDetailsService from "../interfaces/IDetailsService";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IMessageDocument } from "../../../entities/messageEntities";
import { getSignedImageURL } from "../../../middlewares/common/uploadS3";
import {IDoctor} from "../../../dto/doctorDTO";

@injectable()
export default class DetailsService implements IDetailsService {

    constructor(
      @inject("IDoctorRepository") private _doctorRepository:IDoctorRepository,
      @inject("IUserRepository") private _userRepository:IUserRepository,

    ){

    }

async getDoctor(doctorId: string): Promise<IDoctor> {
  try {
    console.log("doctor id from service... ", doctorId);

    const response = await this._doctorRepository.findOne({ _id: doctorId });
    if (!response) {
      console.log("No doctor found for ID:", doctorId);
      throw new Error("failed to fetch doctor");

    }

    console.log("response from service... ", response);

    const {
      password,
      isBlocked,
      isVerified,
      adminVerified,
      graduationCertificate,
      registrationCertificate,
      verificationId,
      walletBalance,
      subscriptionId,
      ...rest
    } = response.toObject();

    // Validate profile field before calling getSignedImageURL
    if (rest.profile) {
      try {
        rest.profile = await getSignedImageURL(rest.profile);
      } catch (profileError) {
        console.error("Error generating signed URL for profile:", profileError);
        rest.profile =''
      }
    } else {
      console.log("No profile image provided for doctor:", doctorId);
      rest.profile = ''; 
    }

    console.log("rest is ......", rest);
    return rest;
  } catch (error) {
    console.error("Error in getDoctor:", error);
    throw error;
  }
}

async getUser(userId: string): Promise<IDoctor> {
  try {
    console.log("user id from service... ", userId);

    const response = await this._userRepository.findOne({ _id: userId });
    if (!response) {
      console.log("No user found for ID:", userId);
      throw new Error("failed to fetch user");

    }

    console.log("response from service... ", response);

    const {
      password,
      isBlocked,
      isVerified,
      walletBalance,
      ...rest
    } = response.toObject();

    // Validate profile field before calling getSignedImageURL
    if (rest.profile) {
      try {
        rest.profile = await getSignedImageURL(rest.profile);
      } catch (profileError) {
        console.error("Error generating signed URL for profile:", profileError);
        rest.profile =''
      }
    } else {
      console.log("No profile image provided for user:", userId);
      rest.profile = ''; 
    }

    console.log("rest is ......", rest);
    return rest;
  } catch (error) {
    console.error("Error in getDoctor:", error);
    throw error;
  }
}



}