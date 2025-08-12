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
    
    async uptadeOneWithUpsert(
        filter: any,
        update: any
    ): Promise<IPrescriptionDocument> {
        try {
            const options = { upsert: true, new:true, strict: false };
            const updatedDocument = await this._prescriptionModel.findOneAndUpdate(filter, update, options);
            return updatedDocument;
        } catch (err) {
           console.log("Error updating document",err);
           throw err;
        }
    
    };
}