import { injectable, inject } from "inversify";
import { IMessageDocument } from "../../entities/messageEntities"; 
import BaseRepository from "./baseRepository";
import IMessageRepository from "../interfaces/IMessageRepository";

@injectable()
export default class MessageRepository
  extends BaseRepository<IMessageDocument>
  implements IMessageRepository
{
  constructor(@inject("messageModel") private _messageModel: any) {
    super(_messageModel);
  }

async createMessage(data: Partial<IMessageDocument>): Promise<IMessageDocument> {
  return await this._messageModel.create({
    ...data,
    timestamp: data.timestamp || new Date().toISOString(),
  });
}

  async getMessagesByConversation(conversationId: string): Promise<IMessageDocument[]> {
    return await this._messageModel.find({ conversationId }).sort({ createdAt: 1 });
  }

  async markMessagesAsSeen(conversationId: string, userId: string): Promise<void> {
  await this._messageModel.updateMany(
    { conversationId, senderId: { $ne: userId }, readBy: { $ne: userId } },
    { $push: { readBy: userId } }
  );
}


}
