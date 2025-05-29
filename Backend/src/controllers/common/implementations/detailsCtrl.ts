import { Request, Response } from "express";
import IDetailsCtrl from "../interfaces/IDetailsCtrl";
import { inject,injectable } from "inversify";
import IDetailsService from "../../../services/common/interfaces/IDetailsService";


@injectable()
export default class DetailsController implements IDetailsCtrl {
private _detailsService: IDetailsService;

  constructor(@inject("IDetailsService")DetailsService:IDetailsService ){
    this._detailsService = DetailsService
  }


  async getDoctor(req:Request,res:Response):Promise<any>{

    try{

        const doctorId = req.query.doctorId;
        console.log("doctor id is ",doctorId);
      if (doctorId) {
      const response = await this._detailsService.getDoctor(doctorId.toString());
        return  res.status(200).json(response);

    };

      res.status(400).json({ message: "doctor ID is required" });
        return;
    }catch(error){
      console.error("Error fetching dector details:", error);
      res.status(500).json({ message: "Failed to fetch dector details" });
    }
  }

}