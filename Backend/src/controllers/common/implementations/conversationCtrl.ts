
import { Request, Response } from "express";
import IConversationCtrl from "../interfaces/IConversationCtrl";
import { inject,injectable } from "inversify";
import IConversationService from "../../../services/common/interfaces/IConversationService";


@injectable()
export default class ConversationController implements IConversationCtrl {
private _conversationService: IConversationService;

  constructor(@inject("IConversationService")ConversationService:IConversationService ){
    this._conversationService = ConversationService
  }

async createConversation(req: Request, res: Response):Promise<any> {
  const { userIds } = req.body;
  const conversation = await this._conversationService.createOrGetConversation(userIds);
  res.json(conversation);
};

async getConversations (req: Request, res: Response):Promise<any>  {

  try{

  const doctorId = req.params.doctorId;
  const conversations = await this._conversationService.getUserConversations(doctorId);
  res.status(200).json(conversations);

  }catch(error){
    console.log(error);
    res.status(500).json({ msg: error || 'Failed to fetch conversations' });
  }
  
};



}