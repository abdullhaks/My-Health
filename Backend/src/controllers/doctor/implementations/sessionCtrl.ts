import {Request,Response} from "express";
import IDoctorSessionCtrl from "../interfaces/ISessionCtrl";
import { inject,injectable} from "inversify";
import IDoctorSessionService from "../../../services/doctor/interfaces/IDoctorSessionService";

@injectable()
export default class DoctorSessionController implements IDoctorSessionCtrl{

constructor(

    @inject("IDoctorSessionService") private _sessionService: IDoctorSessionService,
){

}

async addSessions (req:Request,res:Response):Promise<any>{

    try{
        
    const {sessionData} = req.body;
    console.log("session data is ",sessionData);

    const response = await this._sessionService.addSessions(sessionData)

    return res.status(201).json(response)
 
    }catch(error){
        console.error("error in add sessions :", error);
        return res.status(500).json({ message: "add sessions failed" });
    }

    


}

}