    import { NextFunction,Request,Response } from "express";
    
    export default interface IAdminDoctorCtrl{
        getDoctors(req:Request,res:Response):Promise<void>
        getDoctor(req:Request,res:Response):Promise<void>
        verifyDoctor(req:Request , res:Response):Promise<void>
        declineDoctor(req:Request , res:Response):Promise<void>
        block(req:Request,res:Response):Promise<void>
        unblock(req:Request,res:Response):Promise<void>
    }