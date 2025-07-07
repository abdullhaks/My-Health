import { Request,Response } from "express";

export default interface IUserSessionCtrl {
getSessions (req:Request,res:Response):Promise<any>
getBookedSlots (req:Request,res:Response):Promise<any>

}