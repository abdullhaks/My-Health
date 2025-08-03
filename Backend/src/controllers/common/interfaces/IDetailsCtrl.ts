import { Request,Response } from "express";

export default interface IDetailsCtrl{
getDoctor(req:Request,res:Response):Promise<void>
getUser(req:Request,res:Response):Promise<void>
}