
import { Request, Response } from "express";
import IConversationCtrl from "../interfaces/IConversationCtrl";
import { inject,injectable } from "inversify";
import IConversationService from "../../../services/common/interfaces/IConversationService";
import { HttpStatusCode } from "../../../utils/enum";



@injectable()
export default class ConversationController implements IConversationCtrl {

  constructor(@inject("IConversationService") private _conversationService: IConversationService
 ){  }

async createConversation(req: Request, res: Response): Promise<void> {
    try {
      const { userIds } = req.body;

      console.log("usearids from contorller ....",userIds);
      
      if (!Array.isArray(userIds) || userIds.length !== 2) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Exactly two user IDs (doctor and user) are required" });
        return;
      }
      // if (!userIds.includes(req.userId)) { // Assuming req.userId from verifyAccessTokenMidleware
      //   res.status(403).json({ message: "Doctor ID must be included in userIds" });
      //   return;
      // }
      const conversation = await this._conversationService.createOrGetConversation(userIds);
      res.status(HttpStatusCode.CREATED).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to create conversation" });
    }
  }

  async getConversations(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = req.params.doctorId;
      let from = req.query.from as string | undefined;
      console.log("from doc... is ...", from);

      if (!doctorId || !from) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Doctor ID is required and doc location" });
        return;
      }
      // if (doctorId !== req.userId) { // Assuming req.userId from verifyAccessTokenMidleware
      //   res.status(403).json({ message: "Unauthorized access" });
      //   return;
      // }
      const conversations = await this._conversationService.getUserConversations(doctorId, from as string);
      res.status(HttpStatusCode.OK).json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch conversations" });
    }
  }



}