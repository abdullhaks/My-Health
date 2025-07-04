import { Request, Response } from "express";
import IUserSessionCtrl from "../interfaces/ISessionCtrl";
import { inject, injectable } from "inversify";
import IUserSessionService from "../../../services/user/interfaces/IUserSessionService";
import { HttpStatusCode } from "../../../utils/enum";

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
        return res.status(HttpStatusCode.OK).json(response);
        }
        return res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get sessions",error);
        return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get sessions failed"});
    }
}


}
