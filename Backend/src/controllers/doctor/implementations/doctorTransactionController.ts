import { Response,Request } from "express";
import IDoctorTransactionController from "../interfaces/IDoctorTransactionController";
import { inject, injectable } from "inversify";
import IDoctorTransactionsService from "../../../services/doctor/interfaces/IDoctorTransactionServices";
import { HttpStatusCode } from "../../../utils/enum";

interface filter {
  method?: string;
  paymentFor?: string;
  startDate?: string;
  endDate?: string;
}


@injectable()

export default class DoctorTransactionController implements IDoctorTransactionController {

    constructor(
        @inject("IDoctorTransactionsService") private _doctorTransactionService: IDoctorTransactionsService
    ) { };

 async getRevenues(req: Request, res: Response): Promise<void> {
    try {
      const { doctorId, page, limit, status, startDate, endDate } = req.query;
      const pageNumber = parseInt(page as string) || 1;
      const limitNumber = parseInt(limit as string) || 5;
      const filters: filter = {
        paymentFor: status as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };
      const revenues = await this._doctorTransactionService.getRevenues(doctorId as string, pageNumber, limitNumber, filters);
      res.status(HttpStatusCode.OK).json(revenues);

    } catch (err) {
      console.error("Error in fetching revenues:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
    }
  }

};