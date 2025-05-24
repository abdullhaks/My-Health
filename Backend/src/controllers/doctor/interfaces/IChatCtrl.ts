import { Request,Response } from "express";

export default interface IDoctorChatCtrl{

    createConversation(req: Request, res: Response):Promise<any> ;
    getConversations (req: Request, res: Response):Promise<any> ;
    sendMessage (req: Request, res: Response):Promise<any> 
    getMessages(req: Request, res: Response):Promise<any>
    

}