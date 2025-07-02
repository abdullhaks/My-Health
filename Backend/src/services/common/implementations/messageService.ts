import {inject,injectable} from "inversify"
import IMessageService from "../interfaces/IMessageService";
import IMessageRepository from "../../../repositories/interfaces/IMessageRepository";
import { IMessageDocument } from "../../../entities/messageEntities";

@injectable()
export default class MessageService implements IMessageService {

    constructor(
      @inject("IMessageRepository") private _messageRepository:IMessageRepository,

    ){

    }

    async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: string = "text" 
  ): Promise<IMessageDocument> {
    if (!conversationId || !senderId || !content || !type) {
      throw new Error("Conversation ID, sender ID, and content are required");
    }

    return await this._messageRepository.createMessage({
      conversationId,
      senderId,
      content,
      type,
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