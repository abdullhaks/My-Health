import { IAdmin } from "../../../dto/adminDTO"
import { IResponseDTO } from "../../../dto/commonDTO";


export default interface IAdminAuthService {

    login(userData:Partial<IAdmin>):Promise<{message:string;admin:IAdmin;accessToken:string;refreshToken:string}>
    forgotPassword(email:string):Promise<{message:string,email:string}>
    verifyRecoveryPassword(email: string, recoveryCode: string): Promise<boolean>
    // getRecoveryPassword(email:string):Promise<any>
    // resetPassword(email:string,password:string):Promise<any>
    refreshToken(token:string):Promise<IResponseDTO>
}