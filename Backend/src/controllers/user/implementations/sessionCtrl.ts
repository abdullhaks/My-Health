import { Request, Response } from "express";
import IUserSessionCtrl from "../interfaces/ISessionCtrl";
import { inject, injectable } from "inversify";
import IUserSessionService from "../../../services/user/interfaces/IUserSessionService";

@injectable()
export default class UserSessionController implements IUserSessionCtrl {
  constructor(
    @inject("IUserSessionService")
    private _sessionService: IUserSessionService
  ) {}

async getSessions (req:Request,res:Response):Promise<any>{
    try{
        const doctorId =  req.query.doctorId;
        if(doctorId){
        const response = await this._sessionService.getSessions(doctorId.toString());
        return res.status(200).json(response);
        }
        return res.status(401).json({message:"bad request"});


    }catch(error){
        console.log("error in get sessions",error);
        return res.status(500).json({message:"get sessions failed"});
    }
}


}
