import { Response,Request } from "express";
import IUserTransactionController from "../interfaces/IUserTransactionController";
import { inject, injectable } from "inversify";
import IUserTransactionsService from "../../../services/user/interfaces/IUserTransactionServices";
import { HttpStatusCode } from "../../../utils/enum";



injectable()

export default class UserTransactionController implements IUserTransactionController {

   

    constructor(
        @inject("IUserTransactionsService") private _userTransactionService: IUserTransactionsService
    ) { };

 async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const {userId, page, limit, method, paymentFor, startDate, endDate } = req.query;

      if(!userId){
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "userId is required"});
        return
      }

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        method: method as string,
        paymentFor: paymentFor as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const transactions = await this._userTransactionService.getTransactions(userId?.toString(), pageNumber, limitNumber, filters);

      res.status(HttpStatusCode.OK).json(transactions);
    } catch (err) {
      console.error("Error in fetching transactions:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }

};



