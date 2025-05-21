import {inject,injectable} from "inversify"
import IMessageService from "../interfaces/IMessageService";
import IMessageRepository from "../../../repositories/interfaces/IMessageRepository";

@injectable()
export default class MessageService implements IMessageService {

    constructor(
      @inject("IMessageRepository") private _messageRepository:IMessageRepository,

    ){

    }

    async sendMessage(conversationId: string, senderId: string, content: string) {
  return await this._messageRepository.createMessage({
    conversationId,
    senderId,
    content,
    timestamp: new Date().toISOString(),
    readBy: [senderId], // Initialize with sender
  });
}

  async getMessages(conversationId: string) {
    return await this._messageRepository.getMessagesByConversation(conversationId);
  }

  async markMessagesAsSeen(conversationId: string, userId: string) {
   return await this._messageRepository.markMessagesAsSeen(conversationId, userId);
  }

}