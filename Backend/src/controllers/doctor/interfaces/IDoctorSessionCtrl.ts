import { Request,Response } from "express";

export default interface IDoctorSessionCtrl {
addSession (req:Request,res:Response):Promise<void>
getSessions (req:Request,res:Response):Promise<void>
getBookedSlots (req:Request,res:Response):Promise<void>
deleteSession (req:Request,res:Response):Promise<void>
updateSession (req:Request,res:Response):Promise<void>
makeDayUnavailable (req:Request,res:Response):Promise<void>
makeDayAvailable (req:Request,res:Response):Promise<void>
getUnavailableDays (req:Request,res:Response):Promise<void>
unAvailableSessions (req:Request,res:Response):Promise<void>
getUnavailablSessions (req:Request,res:Response):Promise<void>
makeSessionsAvailable (req:Request,res:Response):Promise<void>

}