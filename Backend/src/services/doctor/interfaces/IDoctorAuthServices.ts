import { IResponseDTO } from "../../../dto/commonDTO"
import {IDoctor} from "../../../dto/doctorDTO"
import { Response } from "express"

interface IParsed {
  title?:string;
  certificate?:{
      buffer: Buffer;
      originalname: string;
      mimetype: string;
    };
}

  interface ICertificates {
    registrationCertificate: {
        buffer: Buffer<ArrayBufferLike>;
        originalname: string;
        mimetype: string;
    } | undefined;
    graduationCertificate: {
        buffer: Buffer<ArrayBufferLike>;
        originalname: string;
        mimetype: string;
    } | undefined;
     verificationId: {
        buffer: Buffer<ArrayBufferLike>;
        originalname: string;
        mimetype: string;
    } | undefined;
}

export default interface IDoctorAuthService {

    login(res:Response ,doctorData: Partial<IDoctor>): Promise<{message:string,doctor:IDoctor,accessToken?:string,refreshToken?:string}> 
    sendMail(email: string, otp: string): Promise<void> 
    refreshToken(refreshToken: string): Promise<IResponseDTO> 
    signup(doctor:Partial<IDoctor>,certificates:ICertificates,parsedSpecializations:IParsed[]): Promise<{message:string,email:string}>
    verifyOtp(email:string, otp:string):Promise<{message:string}>
    resentOtp(email:string):Promise<{message:string}>

}