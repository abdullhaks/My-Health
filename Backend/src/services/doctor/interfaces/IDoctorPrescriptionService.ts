

export default interface IDoctorPrescriptionService {

    getPrescriptions(userId:string):Promise<any>
    submitPrescription(prescriptionData:any):Promise<any>
    
    
}