import IPrescriptionDocument from "../../entities/prescriptionEntities";
import IPrescriptionRepository from "../interfaces/IPrescriptionRepositiory";
import BaseRepository from "./baseRepository";
import { inject,injectable } from "inversify";



@injectable()
export default class PrescriptionRepository extends BaseRepository<IPrescriptionDocument> implements IPrescriptionRepository{

    constructor(
        @inject("prescriptionModel") private _prescriptionModel : any
    ){
        super(_prescriptionModel)
    }
    
}