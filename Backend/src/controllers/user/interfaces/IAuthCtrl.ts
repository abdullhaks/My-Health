import { NextFunction,Request,Response } from "express";

export default interface IAuthCtrl{
    userLogin(req:Request,res:Response):Promise<void>
}