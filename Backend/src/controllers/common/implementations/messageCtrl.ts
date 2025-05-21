
import { Request, Response } from "express";
import IMessageCtrl from "../interfaces/IMessageCtrl";
import { inject,injectable } from "inversify";
import IMessageService from "../../../services/common/interfaces/IMessageService";


@injectable()
export default class MessageController implements IMessageCtrl {
private _messageService: IMessageService;

  constructor(@inject("IMessageService")MessageService:IMessageService ){
    this._messageService = MessageService
  }

async sendMessage (req: Request, res: Response):Promise<any> {
  const { conversationId, senderId, text } = req.body;
  const message = await this._messageService.sendMessage(conversationId, senderId, text);
  res.json(message);
};

async getMessages(req: Request, res: Response):Promise<any> {
  const { conversationId } = req.params;
  const messages = await this._messageService.getMessages(conversationId);
  res.json(messages);
};



}