    import { NextFunction,Request,Response } from "express";
    
    export default interface IAdminDoctorCtrl{
        getDoctors(req:Request,res:Response):Promise<any>


    }