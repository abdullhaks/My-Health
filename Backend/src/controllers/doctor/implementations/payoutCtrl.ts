import { inject,injectable } from "inversify";
import { Request,Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IDoctorPayoutController from "../interfaces/IPayoutCtrl";
import IDoctorPayoutService from "../../../services/doctor/interfaces/IDoctorPayoutService";

@injectable()
export default class DoctorPayoutController implements IDoctorPayoutController  {
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


}