import { IResponseDTO } from "../../../dto/commonDTO"
import {IDoctor} from "../../../dto/doctorDTO"
import { Response } from "express"

export default interface IDoctorAuthService {

    login(res:Response ,doctorData: Partial<IDoctor>): Promise<any> 
    refreshToken(refreshToken: string): Promise<IResponseDTO> 
    signup(doctor:Partial<IDoctor>,certificates:any,parsedSpecializations:any): Promise<any>
    verifyOtp(email:string, otp:string):Promise<any>
    resentOtp(email:string):Promise<any>
}