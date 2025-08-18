import { Request, Response } from "express";
import IDetailsCtrl from "../interfaces/IDetailsCtrl";
import { inject,injectable } from "inversify";
import IDetailsService from "../../../services/common/interfaces/IDetailsService";
import { HttpStatusCode } from "../../../utils/enum";



@injectable()
export default class DetailsController implements IDetailsCtrl {


  constructor(@inject("IDetailsService") private _detailsService: IDetailsService)
  { }


  async getDoctor(req:Request,res:Response):Promise<void>{

    try{

        const doctorId = req.query.doctorId; 
        console.log("doctor id is ",doctorId);
      if (doctorId) {
      const response = await this._detailsService.getDoctor(doctorId.toString());
          res.status(HttpStatusCode.OK).json(response);
          return
    };

      res.status(HttpStatusCode.BAD_REQUEST).json({ message: "doctor ID is required" });
        return 
    }catch(error){
      console.error("Error fetching dector details:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch dector details" });
    }
  }



   async getUser(req:Request,res:Response):Promise<void>{

    try{

        const userId = req.query.userId; 
        console.log("user id is ",userId);
      if (userId) {
      const response = await this._detailsService.getUser(userId.toString());
          res.status(HttpStatusCode.OK).json(response);
          return
    };

      res.status(HttpStatusCode.BAD_REQUEST).json({ message: "user ID is required" });
        return 
    }catch(error){
      console.error("Error fetching user details:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch user details" });
    }
  }

}