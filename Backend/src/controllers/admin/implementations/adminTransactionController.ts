import { Response,Request } from "express";
import IAdminTransactionController from "../interfaces/IAdminTransactionController"; 
import { inject, injectable } from "inversify";
import IAdminTransactionsService from "../../../services/admin/interfaces/IAdminTransactionServices";
import { HttpStatusCode } from "../../../utils/enum";



injectable()

export default class AdminTransactionController implements IAdminTransactionController {

   

    constructor(
        @inject("IAdminTransactionsService") private _adminTransactionService: IAdminTransactionsService
    ) { };

 async getTransactions(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, method, paymentFor, startDate, endDate } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const limitNumber = limit ? parseInt(limit as string, 10) : 10;

      const filters = {
        method: method as string,
        paymentFor: paymentFor as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const transactions = await this._adminTransactionService.getTransactions(pageNumber, limitNumber, filters);

      res.status(HttpStatusCode.OK).json(transactions);
    } catch (err) {
      console.error("Error in fetching transactions:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }

};



