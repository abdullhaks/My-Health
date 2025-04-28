import {IDoctor} from "../../../dto/doctorDto"
import { Response } from "express"

export default interface IDoctorAuthService {

    login(res:Response ,doctorData: Partial<IDoctor>): Promise<any> 
}