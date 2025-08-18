import { Request,Response } from "express";

export default interface IUserSessionCtrl {
getSessions (req:Request,res:Response):Promise<void>
getBookedSlots (req:Request,res:Response):Promise<void>

}