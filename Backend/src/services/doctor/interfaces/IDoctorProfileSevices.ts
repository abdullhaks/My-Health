import {IDoctor} from "../../../dto/doctorDTO"
import { Response } from "express"

export default interface IDoctorProfileService {

verifySubscription (sessionId:string): Promise<any>
updateDoctorDp(userId: string, updatedFields: any, fileKey: string | undefined): Promise<any> 
updateProfile(userId:string,userData: Partial<IDoctor> ): Promise<any> 

}