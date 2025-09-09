import {doctorProfileUpdate, IDoctor} from "../../../dto/doctorDTO"

export default interface IDoctorProfileService {

verifySubscription (sessionId:string,doctorId:string): Promise<{message:string,doctor:Partial<IDoctor>}>
updateDoctorDp(userId: string, updatedFields: Partial<IDoctor>, fileKey: string | undefined): Promise<IDoctor> 
updateProfile(userId:string,userData: doctorProfileUpdate ): Promise<{message:string,updatedDoctor:Partial<IDoctor>}> 

}