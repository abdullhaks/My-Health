import { Request,Response } from "express";

export default interface IDoctorSessionCtrl {
addSessions (req:Request,res:Response):Promise<void>
getSessions (req:Request,res:Response):Promise<void>


}