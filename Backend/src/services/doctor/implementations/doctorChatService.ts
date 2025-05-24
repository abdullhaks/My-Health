import {inject,injectable} from "inversify"
import IDoctorChatService from "../interfaces/IDoctorChatService";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";
import { IConversationDocument } from "../../../entities/conversationEntities";
import IMessageRepository from "../../../repositories/interfaces/IMessageRepository";
import { IMessageDocument } from "../../../entities/messageEntities";

@injectable()
export default class DoctorChatService implements IDoctorChatService {

    constructor(
        @inject("IConversationRepository") private _conversationRepository:IConversationRepository,
        @inject("IMessageRepository") private _messageRepository:IMessageRepository,
      

    ){

    }

 async createOrGetConversation(userIds: string[]): Promise<IConversationDocument> {
    if (!userIds || userIds.length !== 2) {
      throw new Error("Exactly two user IDs are required");
    };

    console.log('userIds.....',userIds);
    const existing = await this._conversationRepository.findConversationByMembers(userIds);

    console.log("existin conversation is ",existing);
    if (existing) return existing;
    return await this._conversationRepository.createConversation(userIds);
  }

  async getUserConversations(userId: string): Promise<IConversationDocument[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return await this._conversationRepository.getUserConversations(userId,"User");
  }

   async sendMessage(
      conversationId: string,
      senderId: string,
      content: string
    ): Promise<IMessageDocument> {
      if (!conversationId || !senderId || !content) {
        throw new Error("Conversation ID, sender ID, and content are required");
      }
  
      return await this._messageRepository.createMessage({
        conversationId,
        senderId,
        content,
        readBy: [senderId],
        status: "sent",
      });
    }
  
    async getMessages(conversationId: string): Promise<IMessageDocument[]> {
      if (!conversationId) {
        throw new Error("Conversation ID is required");
      }
      return await this._messageRepository.getMessagesByConversation(conversationId);
    }
  
    async markMessagesAsSeen(conversationId: string, userId: string): Promise<void> {
      if (!conversationId || !userId) {
        throw new Error("Conversation ID and user ID are required");
      }
      await this._messageRepository.markMessagesAsSeen(conversationId, userId);
    }



}