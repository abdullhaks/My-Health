import { IAdmin } from "../../../dto/adminDTO"
import { Response } from "express"

export default interface IAdminAuthService {

    login(res:Response,userData:Partial<IAdmin>):Promise<any>
    forgotPassword(email:string):Promise<any>
    verifyRecoveryPassword(email: string, recoveryCode: string): Promise<boolean>
    // getRecoveryPassword(email:string):Promise<any>
}