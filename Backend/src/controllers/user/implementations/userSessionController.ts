import { Request, Response } from "express";
import IUserSessionCtrl from "../interfaces/IUserSessionCtrl";
import { inject, injectable } from "inversify";
import IUserSessionService from "../../../services/user/interfaces/IUserSessionService";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class UserSessionController implements IUserSessionCtrl {
  constructor(
    @inject("IUserSessionService")
    private _userSessionService: IUserSessionService
  ) {}

async getSessions (req:Request,res:Response):Promise<void>{
    try{
        const doctorId =  req.query.doctorId;
        if(doctorId){
        const response = await this._userSessionService.getSessions(doctorId.toString());
         res.status(HttpStatusCode.OK).json(response);
         return
        }
         res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get sessions",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get sessions failed"});
    }
};



async getBookedSlots (req:Request,res:Response):Promise<void>{
    try{
        const {doctorId, selectedDate} =  req.query;
        if(doctorId && selectedDate){
        const response = await this._userSessionService.getBookedSlots(doctorId.toString(),selectedDate.toString());
         res.status(HttpStatusCode.OK).json(response);
         return
        }
         res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get sessions",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get sessions failed"});
    }
};


async getUnavailableDays (req:Request,res:Response):Promise<void>{
  try{
    const {doctorId} = req.query;
    console.log("doctorId is....:", doctorId);
    
      if(doctorId){
      const response = await this._userSessionService.getUnavailableDays(doctorId.toString());
       res.status(HttpStatusCode.OK).json(response);
       return
      //  res.status(HttpStatusCode.OK);
      }
       res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
  }catch(error){
      console.log("error in fetching unavailable days ",error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"fetching unavailable days failed"})
}
}



async getUnavailablSessions (req:Request,res:Response):Promise<void>{
  try{
    const {doctorId} = req.query;
    console.log("doctorId is....:///////////", doctorId);
    
      if(doctorId){
      const response = await this._userSessionService.getUnavailablSessions(doctorId.toString());
       res.status(HttpStatusCode.OK).json(response);
       return
    
      }
       res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
  }catch(error){
      console.log("error in fetching unavailable sessions ",error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"fetching unavailable sessions failed"})
  }


}





}
