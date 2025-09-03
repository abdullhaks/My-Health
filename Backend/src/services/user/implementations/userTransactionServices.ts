import { inject , injectable } from "inversify";
import IUserTransactionsService from "../interfaces/IUserTransactionServices";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";
import { ITransactions } from "../../../dto/transactionDto";


interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}


@injectable()

export default class UserTransactionsService implements IUserTransactionsService {

    constructor(
     
      @inject("ITransactionRepository") private _transactionRepository:ITransactionRepository,
      
    ){
    
    }

  async getTransactions(userId:string, pageNumber: number, limitNumber: number, filters: filter = {}): Promise<ITransactions[]> {
    const query: any = {userId:userId};

    if (filters.method) {
      query.method = filters.method;
    }
    if (filters.paymentFor) {
      query.paymentFor = filters.paymentFor;
    }
    if (filters.startDate && filters.endDate) {
      query.date = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate),
      };
    }

    const transactions = await this._transactionRepository.getAllTransactions(pageNumber, limitNumber, query);
    console.log("transactions from service...", transactions);

    return transactions;
  }

}
