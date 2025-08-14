import { Request, Response } from "express";
import IDoctorSessionCtrl from "../interfaces/ISessionCtrl";
import { inject, injectable } from "inversify";
import IDoctorSessionService from "../../../services/doctor/interfaces/IDoctorSessionService";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class DoctorSessionController implements IDoctorSessionCtrl {
  constructor(
    @inject("IDoctorSessionService")
    private _sessionService: IDoctorSessionService
  ) {}

  async addSessions(req: Request, res: Response): Promise<void> {
    try {
      const { sessionData } = req.body;
      console.log("session data is ", sessionData);

      const response = await this._sessionService.addSessions(sessionData);

       res.status(HttpStatusCode.CREATED).json(response);
    } catch (error) {
      console.error("error in add sessions :", error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "add sessions failed" });
    }
  }

async getSessions (req:Request,res:Response):Promise<void>{
    try{
        const doctorId =  req.query.doctorId;
        if(doctorId){
        const response = await this._sessionService.getSessions(doctorId.toString());
         res.status(HttpStatusCode.OK).json(response);
         return
        }
         res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get sessions",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get sessions failed"});
    }
}


async getBookedSlots (req:Request,res:Response):Promise<void>{
    try{
        const {doctorId, selectedDate} =  req.query;
        if(doctorId && selectedDate){
        const response = await this._sessionService.getBookedSlots(doctorId.toString(),selectedDate.toString());
         res.status(HttpStatusCode.OK).json(response);
         return
        }
         res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get sessions",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get sessions failed"});
    }
}



}
