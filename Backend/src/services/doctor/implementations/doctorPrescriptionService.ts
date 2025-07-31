import IPrescriptionRepository from "../../../repositories/interfaces/IPrescriptionRepositiory";
import IDoctorPrescriptionService from "../interfaces/IDoctorPrescriptionService";
import {inject , injectable} from "inversify"

@injectable()
export default class DoctorPrescriptionService implements IDoctorPrescriptionService {

    constructor(
        @inject("IPrescriptionRepository") private _prescriptionRepository : IPrescriptionRepository
    ){}


    async getPrescriptions(userId: string): Promise<any> {
        
        const response = await this._prescriptionRepository.findAll({userId:userId});
        return response
    }


    async submitPrescription(prescriptionData: any): Promise<any> {
        
        const response = await this._prescriptionRepository.create(prescriptionData);
        return response;
    }

    
}