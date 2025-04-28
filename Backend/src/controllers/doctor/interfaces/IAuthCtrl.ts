import { NextFunction,Request,Response } from "express";

export default interface IDoctorAuthCtrl{

    doctorLogin(req: Request, res:Response): Promise<any> 
}