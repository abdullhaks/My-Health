import { IUser } from "../../../dto/userDTO"
import { IUserResponse } from "../../../dto/userDTO";
import { IResponseDTO } from "../../../dto/commonDTO";
import { AuthResponseDTO } from "../../../dto/userDTO";
import { UserLoginRequestDTO } from "../../../dto/userDTO";

export default interface IUserAuthService {

    login(userData:UserLoginRequestDTO):Promise<AuthResponseDTO>
    signup(userData:Partial<IUser>):Promise<Partial<IUserResponse>>
    sendMail(email:string,otp:string):Promise<void>
    verifyOtp(email:string,otp:string):Promise<Partial<IUserResponse>>
    resentOtp(email:string):Promise<Partial<IUserResponse>>
    forgotPassword(email:string):Promise<Partial<IUserResponse>>
    verifyRecoveryPassword(email: string, recoveryCode: string): Promise<boolean>
    resetPassword(email:string , newPassword:string):Promise<IUser>
    refreshToken(token:string):Promise<IResponseDTO>
    getMe(email:String):Promise<Partial<IUserResponse>>
}