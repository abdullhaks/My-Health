import { Request,Response } from "express";

export default interface IConversationCtrl{

    createConversation(req: Request, res: Response):Promise<void> ;
    getConversations (req: Request, res: Response):Promise<void> ;
    

}