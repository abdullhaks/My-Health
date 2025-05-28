import { Request,Response } from "express";

export default interface IDoctorSessionCtrl {
addSessions (req:Request,res:Response):Promise<any>
getSessions (req:Request,res:Response):Promise<any>


}