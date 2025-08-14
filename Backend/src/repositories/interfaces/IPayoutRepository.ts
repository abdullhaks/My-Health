import BaseRepository from "../implementations/baseRepository";
import { IPayoutDocument } from "../../entities/payoutEntities";


export default interface IPayoutRepository extends BaseRepository<IPayoutDocument>{
   
    getPayouts(page: number, limit: number, query: any): Promise<any> 
}