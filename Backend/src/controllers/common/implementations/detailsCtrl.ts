import { Request, Response } from "express";
import IDetailsCtrl from "../interfaces/IDetailsCtrl";
import { inject,injectable } from "inversify";
import IDetailsService from "../../../services/common/interfaces/IDetailsService";
import { HttpStatusCode } from "../../../utils/enum";



@injectable()
export default class DetailsController implements IDetailsCtrl {
private _detailsService: IDetailsService;

  constructor(@inject("IDetailsService")DetailsService:IDetailsService ){
    this._detailsService = DetailsService
  }


  async getDoctor(req:Request,res:Response):Promise<void>{

    try{

        const doctorId = req.query.doctorId;
        console.log("doctor id is ",doctorId);
      if (doctorId) {
      const response = await this._detailsService.getDoctor(doctorId.toString());
          res.status(HttpStatusCode.OK).json(response);

    };

      res.status(HttpStatusCode.BAD_REQUEST).json({ message: "doctor ID is required" });
        return 
    }catch(error){
      console.error("Error fetching dector details:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch dector details" });
    }
  }

}