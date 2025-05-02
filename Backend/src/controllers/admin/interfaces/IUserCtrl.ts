    import { NextFunction,Request,Response } from "express";
    
    export default interface IAdminUserCtrl{
        getUsers(req:Request,res:Response):Promise<void>
        block(req:Request,res:Response):Promise<any>
        unblock(req:Request,res:Response):Promise<any>

    }