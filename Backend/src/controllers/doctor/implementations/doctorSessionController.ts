import { Request, Response } from "express";
import IDoctorSessionCtrl from "../interfaces/IDoctorSessionCtrl";
import { inject, injectable } from "inversify";
import IDoctorSessionService from "../../../services/doctor/interfaces/IDoctorSessionService";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class DoctorSessionController implements IDoctorSessionCtrl {
  constructor(
    @inject("IDoctorSessionService")
    private _doctorSessionService: IDoctorSessionService
  ) {}

  async addSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionToAdd } = req.body;
      console.log("session data is ", sessionToAdd);

      const response = await this._doctorSessionService.addSession(sessionToAdd);

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
        const response = await this._doctorSessionService.getSessions(doctorId.toString());
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
        const response = await this._doctorSessionService.getBookedSlots(doctorId.toString(),selectedDate.toString());
         res.status(HttpStatusCode.OK).json(response);
         return
        }
         res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});


    }catch(error){
        console.log("error in get sessions",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"get sessions failed"});
    }
}

async  deleteSession (req:Request,res:Response):Promise<void>{
    try{
      let {sessionId} = req.query;
        if(sessionId){
        const response = await this._doctorSessionService.deleteSession(sessionId.toString());
         res.status(HttpStatusCode.OK).json(response);
         return
        }
         res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
    }catch(error){
        console.log("error in delete session",error);
         res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"delete session failed"});
    }

};

async updateSession(req: Request, res: Response): Promise<void> {
  try {
    const { sessionId, editingSession } = req.body;

    console.log("sessionId and editingSession are:", sessionId, editingSession);
    
    if (!sessionId || !editingSession) {
      res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid request data" });
      return;
    }

    const response = await this._doctorSessionService.updateSession(sessionId, editingSession);

    res.status(HttpStatusCode.OK).json(response);

  } catch (error) {
    console.error("Error in updateSession:", error);
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Update session failed" });
  }
}


async makeDayUnavailable (req:Request,res:Response):Promise<void>{
  try{
    const {doctorId, date} = req.body;
    console.log("doctorId and day are:", doctorId, date);
    
      if(doctorId && date){
      const response = await this._doctorSessionService.makeDayUnavailable(doctorId,date);
       res.status(HttpStatusCode.OK).json(response);
      //  res.status(HttpStatusCode.OK);
      return;
      }
       res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
  }catch(error){
      console.log("error in make day unavailable",error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"make day unavailable failed"});
  } 
};



async makeDayAvailable (req:Request,res:Response):Promise<void>{
  try{
    const {doctorId, date} = req.query;
    console.log("doctorId and day are:", doctorId, date);
    
      if(doctorId && date){
      const dateObj = new Date(date.toString());
      const response = await this._doctorSessionService.makeDayAvailable(doctorId.toString(), dateObj);
       res.status(HttpStatusCode.OK).json(response);
      //  res.status(HttpStatusCode.OK);
      return;
      }
       res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
  }catch(error){
      console.log("error in make day available",error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"make day available failed"});
  } 
}



async getUnavailableDays (req:Request,res:Response):Promise<void>{
  try{
    const {doctorId} = req.query;
    console.log("doctorId is....:", doctorId);
    
      if(doctorId){
      const response = await this._doctorSessionService.getUnavailableDays(doctorId.toString());
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

async unAvailableSessions (req:Request,res:Response):Promise<void>{
  try{
    const {doctorId, date, sessionId} = req.body;
    console.log("doctorId and day are:", doctorId, date, sessionId);
    
      if(doctorId && date && sessionId){
      const response = await this._doctorSessionService.unAvailableSessions(doctorId,date,sessionId);
       res.status(HttpStatusCode.OK).json(response);
      //  res.status(HttpStatusCode.OK);
      return;
      }
       res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
  }catch(error){
      console.log("error in make session unavailable",error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"make session unavailable failed"});
  } 

}



async makeSessionsAvailable (req:Request,res:Response):Promise<void>{
  try{
     const {doctorId, date, sessionId} = req.query;
    console.log("doctorId and day are:", doctorId, date, sessionId);
    const dateObj = date ? new Date(date.toString()) : undefined;
    console.log("dateObj is", dateObj);
      if(doctorId && dateObj && sessionId){
      const response = await this._doctorSessionService.makeSessionsAvailable(doctorId.toString(), dateObj, sessionId.toString());
       res.status(HttpStatusCode.OK).json(response);
      //  res.status(HttpStatusCode.OK);
      return;
      }
       res.status(HttpStatusCode.BAD_REQUEST).json({message:"bad request"});
  }catch(error){
      console.log("error in make session available",error);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({message:"make session available failed"});
  } 
}

async getUnavailablSessions (req:Request,res:Response):Promise<void>{
  try{
    const {doctorId} = req.query;
    console.log("doctorId is....:///////////", doctorId);
    
      if(doctorId){
      const response = await this._doctorSessionService.getUnavailablSessions(doctorId.toString());
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