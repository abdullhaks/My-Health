import { inject,injectable } from "inversify";
import { Request,Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IAdminPayoutController from "../interfaces/IAdminPayoutController";
import IAdminPayoutService from "../../../services/admin/interfaces/IAdminPayoutService";

@injectable()
export default class AdminPayoutController implements IAdminPayoutController  {
    constructor(
       @inject("IAdminPayoutService") private _adminPayoutService:IAdminPayoutService
    ){
      
    };

  async getPayouts(req: Request, res: Response): Promise<void> {
      try {
        const {page,limit,status, startDate, endDate } = req.query;
  
        const pageNumber = page ? parseInt(page as string, 10) : 1;
        const limitNumber = limit ? parseInt(limit as string, 10) : 10;
  
        const filters = {
          status: status as string,
          startDate: startDate as string,
          endDate: endDate as string,
        };
  
        const transactions = await this._adminPayoutService.getgetPayouts(pageNumber, limitNumber, filters);
  
        res.status(HttpStatusCode.OK).json(transactions);
      } catch (err) {
        console.error("Error in fetching transactions:", err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
      }
    }


    async updatePayout(req: Request, res: Response): Promise<void> {
      try {
        const {id,status,on,paid, transactionId, invoiceLink} = req.body;
  
        if(status&&status==="paid"){

          let data={
            status: 'paid',
            paid: paid,
            transactionId: transactionId,
            invoiceLink:invoiceLink||"",
            on: on,
          }
        const result  = await this._adminPayoutService.updatePayout(id,data);
        res.status(HttpStatusCode.OK).json(result);
          return
        }else if (status&& status==="rejected"){

        
        
         let  data2 ={
            status: 'rejected',
            on: new Date().toISOString(),
          }
        const result  = await this._adminPayoutService.updatePayout(id,data2);
        res.status(HttpStatusCode.OK).json(result);
        return
        }
  
        res.status(HttpStatusCode.BAD_REQUEST).json("payment updation failed");
      } catch (err) {
        console.error("Error in fetching transactions:", err);
        res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Server error" });
      }
    }



}