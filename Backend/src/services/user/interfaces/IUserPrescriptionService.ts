

export default interface IUserPrescriptionService {

    getPrescription(appointmentId:string):Promise<any>
    getLatestPrescription(userId:string):Promise<any>
    
}