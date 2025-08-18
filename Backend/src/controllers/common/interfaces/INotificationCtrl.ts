import { Request,Response } from "express";

export default interface INotificationCtrl {

    createNotification (req:Request,res:Response):Promise<void>
    readAllNotifications (req:Request,res:Response):Promise<void>
    getNewNotifications (req:Request,res:Response):Promise<void>
    getAllNotifications (req:Request,res:Response):Promise<void>

}