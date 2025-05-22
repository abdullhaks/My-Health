
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

async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId, senderId, content } = req.body;

      console.log(" conversationId, senderId, content ", conversationId, senderId, content );
      
      const fileUrl = req.file ? (req.file as any).location : undefined;
      if (!conversationId || !senderId || (!content && !fileUrl)) {
        res.status(400).json({ message: "Conversation ID, sender ID, and content or file are required" });
        return;
      }
      // if (senderId !== req.userId) { // Assuming req.userId from verifyAccessTokenMidleware
      //   res.status(403).json({ message: "Unauthorized action" });
      //   return;
      // }

      // fileUrl - add as argument if file sharing in chat........
      const message = await this._messageService.sendMessage(conversationId, senderId, content);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const { conversationId } = req.params;
      if (!conversationId) {
        res.status(400).json({ message: "Conversation ID is required" });
        return;
      }
      const messages = await this._messageService.getMessages(conversationId);
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  }



}