import { inject,injectable } from "inversify";
import { Request,Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IDoctorPayoutCtrl from "../interfaces/IDoctorPayoutCtrl";
import IDoctorPayoutService from "../../../services/doctor/interfaces/IDoctorPayoutService";

@injectable()
export default class DoctorPayoutController implements IDoctorPayoutCtrl  {
    constructor(
       @inject("IDoctorPayoutService") private _doctorPayoutService:IDoctorPayoutService
    ){
      
    };

   async requestPayout(req: Request, res: Response): Promise<void> {

    try {

      const {doctorId, payoutDetails} = req.body;
      console.log("doctor id is ",doctorId);
      console.log("payoutDetails id is ",payoutDetails);

      const response = await this._doctorPayoutService.requestPayout(payoutDetails,doctorId);

      console.log("payout request is .....",response);

      if(!response){
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "requesting payout failed" });
        return;
      }
      res.status(HttpStatusCode.CREATED).json({
        message: "Payout Requested successfully",
        data: response,
      });
    } catch (err) {
      console.error("Error in request payout:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "error in request payout" });
    }
  };


  async getPayouts(req: Request, res: Response): Promise<void> {
      try {
        const {doctorId,page,limit,status, startDate, endDate } = req.query;
  
        if(!doctorId) {
          res.status(HttpStatusCode.BAD_REQUEST).json({ message: "bad request" });
          return
        }
        const pageNumber = page ? parseInt(page as string, 10) : 1;
        const limitNumber = limit ? parseInt(limit as string, 10) : 10;
  
        const filters = {
          status: status as string,
          startDate: startDate as string,
          endDate: endDate as string,
        };
  
        const transactions = await this._doctorPayoutService.getgetPayouts(doctorId?.toString(),pageNumber, limitNumber, filters);
  
        res.status(HttpStatusCode.OK).json(transactions);
      } catch (err) {
        console.error("Error in fetching transactions:", err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
      }
    }


}