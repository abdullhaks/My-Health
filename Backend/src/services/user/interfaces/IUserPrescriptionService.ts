import { IPrescription } from "../../../dto/prescriptionDto"
interface prescriptionReponseDto{
    prescription:IPrescription,
    user:{
        fullName?:string,
        dob?:string
    },
    doctor:{
        fullName?:string, 
        graduation?:string, 
        category?:string, 
        registerNo?:string
    }
}

export default interface IUserPrescriptionService {

    getPrescription(appointmentId:string):Promise<prescriptionReponseDto>
    getLatestPrescription(userId:string):Promise<IPrescription | null>
    getLatestDoctorPrescription(userId:string,doctorId:string):Promise<IPrescription | null>
    
}