import {inject , injectable} from "inversify";
import { ITransactionDocument } from "../../entities/transactionsEntities"; 
import ITransactionRepository from "../interfaces/ITransactionRepository";
import BaseRepository from "./baseRepository";



@injectable()
export default class TransactionRepository extends BaseRepository<ITransactionDocument> implements ITransactionRepository{

constructor(

    @inject("transactionModel") private _transactionModel : any,
){
    super(_transactionModel)
};


 async getAllTransactions(page: number, limit: number, query: any = {}): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const transactions = await this._transactionModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await this._transactionModel.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      return {
        transactions: transactions.map((transaction: any) => ({
          _id: transaction._id.toString(),
          from: transaction.from,
          to: transaction.to,
          method: transaction.method,
          amount: transaction.amount,
          paymentFor: transaction.paymentFor,
          transactionId: transaction.transactionId,
          invoice:transaction.invoice,
          userId: transaction.userId,
          doctorId: transaction.doctorId,
          date: transaction.date,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        })),
        totalPages,
      };
    } catch (err) {
      console.error("Error fetching transactions:", err);
      throw new Error("Failed to fetch transactions");
    }
  }



}

