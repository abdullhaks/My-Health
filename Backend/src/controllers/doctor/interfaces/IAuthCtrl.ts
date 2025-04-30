import { NextFunction,Request,Response } from "express";

export default interface IDoctorAuthCtrl{

    doctorLogin(req: Request, res:Response): Promise<any> 
    doctorSignup( req: Request, res: Response, next: NextFunction ): Promise<any>
}