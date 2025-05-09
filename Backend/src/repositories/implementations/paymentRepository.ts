import { injectable , inject } from "inversify";
import { IDoctorDocument } from "../../entities/doctorEntities";
import BaseRepository from "./baseRepository";
import IPaymentRepository from "../interfaces/IPaymentRepository";

@injectable()

export default class PaymentRepository extends BaseRepository<IDoctorDocument> implements IPaymentRepository{

    constructor(
        @inject("doctorModel") private _doctorModel: any,
        
      
    ) {
        super(_doctorModel);
    }


}