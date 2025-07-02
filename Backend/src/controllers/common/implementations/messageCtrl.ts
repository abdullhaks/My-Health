
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
      console.log("Request body:", req.body);
      // console.log("Authenticated userId:", req.userId);

      const { conversationId, senderId, content,type } = req.body;

      console.log("conversationId, senderId, content:", conversationId, senderId, content);

      if (!conversationId || !senderId || !content) {
        res.status(400).json({ message: "Conversation ID, sender ID, and content are required" });
        return;
      }
      // if (senderId !== req.userId) {
      //   res.status(403).json({ message: "Unauthorized action" });
      //   return;
      // }

      // Validate conversation existence
      // const conversation = await Conversation.findById(conversationId);
      // if (!conversation) {
      //   res.status(404).json({ message: "Conversation not found" });
      //   return;
      // }

      const message = await this._messageService.sendMessage(conversationId, senderId, content ,type);
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