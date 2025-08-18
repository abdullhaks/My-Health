    import { NextFunction,Request,Response } from "express";
    
    export default interface IAdminAuthCtrl{
        adminLogin(req:Request,res:Response):Promise<void>
    
        forgotPassword(req:Request,res:Response):Promise<void>
        
        getRecoveryPassword(req:Request,res:Response):Promise<void>
    
        verifyRecoveryPassword(req:Request,res:Response):Promise<void>
    
        resetPassword(req:Request,res:Response):Promise<void>
    
        refreshToken(req:Request,res:Response):Promise<void>
    }