import { Request,Response } from "express";

export default interface IMessageCtrl{

    sendMessage (req: Request, res: Response):Promise<any> 
    getMessages(req: Request, res: Response):Promise<any>
    
}