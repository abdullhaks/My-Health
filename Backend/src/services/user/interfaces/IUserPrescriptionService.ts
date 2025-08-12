

export default interface IUserPrescriptionService {

    getPrescription(appointmentId:string):Promise<any>
    
    
}