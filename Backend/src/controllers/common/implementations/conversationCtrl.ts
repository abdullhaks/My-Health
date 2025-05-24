
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

async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userIds } = req.body;

      console.log("usearids from contorller ....",userIds);
      
      if (!Array.isArray(userIds) || userIds.length !== 2) {
        res.status(400).json({ message: "Exactly two user IDs (doctor and user) are required" });
        return;
      }
      // if (!userIds.includes(req.userId)) { // Assuming req.userId from verifyAccessTokenMidleware
      //   res.status(403).json({ message: "Doctor ID must be included in userIds" });
      //   return;
      // }
      const conversation = await this._conversationService.createOrGetConversation(userIds);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.doctorId;
      let from = req.query.from as string | undefined;
      console.log("from doc... is ...", from);

      if (!doctorId || !from) {
        res.status(400).json({ message: "Doctor ID is required and doc location" });
        return;
      }
      // if (doctorId !== req.userId) { // Assuming req.userId from verifyAccessTokenMidleware
      //   res.status(403).json({ message: "Unauthorized access" });
      //   return;
      // }
      const conversations = await this._conversationService.getUserConversations(doctorId, from as string);
      res.status(200).json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  }



}