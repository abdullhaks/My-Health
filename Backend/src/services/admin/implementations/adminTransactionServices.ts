import { inject , injectable } from "inversify";
import IAdminTransactionsService from "../interfaces/IAdminTransactionServices";
import ITransactionRepository from "../../../repositories/interfaces/ITransactionRepository";



interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}

@injectable()

export default class AdminTransactionsService implements IAdminTransactionsService {

    constructor(
     
      @inject("ITransactionRepository") private _transactionRepository:ITransactionRepository,
      
    ){
    
    }

  async getTransactions(pageNumber: number, limitNumber: number, filters: filter = {}): Promise<any[]> {
    const query: any = {};

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
