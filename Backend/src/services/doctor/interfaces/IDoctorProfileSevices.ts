import {IDoctor} from "../../../dto/doctorDTO"

export default interface IDoctorProfileService {

verifySubscription (sessionId:string): Promise<{message:string,doctor:Partial<IDoctor>}>
updateDoctorDp(userId: string, updatedFields: Partial<IDoctor>, fileKey: string | undefined): Promise<IDoctor> 
updateProfile(userId:string,userData: Partial<IDoctor> ): Promise<{message:string,updatedDoctor:Partial<IDoctor>}> 

}