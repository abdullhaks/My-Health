import {IDoctor} from "../../../dto/doctorDTO"
import { Response } from "express"

export default interface IDoctorAuthService {

    login(res:Response ,doctorData: Partial<IDoctor>): Promise<any> 
    signup(doctor:Partial<IDoctor>,certificates:any,parsedSpecializations:any): Promise<any>
}