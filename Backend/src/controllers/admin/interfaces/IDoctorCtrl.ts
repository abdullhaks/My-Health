    import { NextFunction,Request,Response } from "express";
    
    export default interface IAdminDoctorCtrl{
        getDoctors(req:Request,res:Response):Promise<any>
        getDoctor(req:Request,res:Response):Promise<any>
        verifyDoctor(req:Request , res:Response):Promise<any>
        declineDoctor(req:Request , res:Response):Promise<any>
    }