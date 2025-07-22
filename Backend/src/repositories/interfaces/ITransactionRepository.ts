import BaseRepository from "../implementations/baseRepository";
import { ITransactionDocument } from "../../entities/transactionsEntities"; 

export default interface ITransactionRepository extends BaseRepository<ITransactionDocument>{

    getAllTransactions(page: number, limit: number, query: any): Promise<any> 

};
