import { IUser } from "../../../dto/userDTO"
import { Response } from "express"

export default interface IUserAuthService {

    login(res:Response,userData:Partial<IUser>):Promise<any>
    signup(userData:Partial<IUser>):Promise<any>
    verifyOtp(email:string,otp:string):Promise<any>
    resentOtp(email:string):Promise<any>
    forgotPassword(email:string):Promise<any>
    verifyRecoveryPassword(email: string, recoveryCode: string): Promise<boolean>
    // getRecoveryPassword(email:string):Promise<any>
    refreshToken(token:string):Promise<any>
}