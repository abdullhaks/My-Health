import { inject,injectable } from "inversify"; 
import IAdminAnalyticsController from "../interfaces/IAdminAnalyticsController";
import IAdminAnalyticsServices from "../../../services/admin/interfaces/IAdminAnalyticsServices";
import {Request,Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import {MESSAGES} from "../../../utils/messages"


injectable();
export default class AdminAnalyticsContorller implements IAdminAnalyticsController{ 

    constructor(
        @inject("IAdminAnalyticsServices")
        private _adminAnalyticsService: IAdminAnalyticsServices

    ){}

  async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.params.filter;
      console.log("Filter received:", filter);
      const response = await this._adminAnalyticsService.getUserAnalytics(filter);
      console.log("response is ....",response);
       res.status(200).json(response);
    } catch (error) {
      console.error("Error in getUserAnalytics controller:", error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.server.serverError });

    }
  }

    async getDoctorAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const filter = req.params.filter;
      console.log("Filter received:", filter);
      const response = await this._adminAnalyticsService.getDoctorAnalytics(filter);
      console.log("response is ....",response);
       res.status(200).json(response);
    } catch (error) {
      console.error("Error in getUserAnalytics controller:", error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.server.serverError });

    }
  };

  async getTotalAnalytics (req:Request,res:Response):Promise<void>{
    try{

      const response = await this._adminAnalyticsService.getTotalAnalytics();
      res.status(HttpStatusCode.OK).json(response);

    }catch(err){
      console.log("error in getTotalAnalytics",err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.server.serverError });

      
    }
  }



}