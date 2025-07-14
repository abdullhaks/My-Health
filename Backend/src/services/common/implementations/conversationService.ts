import {inject,injectable} from "inversify"
import IConversationService from "../interfaces/IConversationService";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";
import {IConversation} from "../../../dto/conversationDTO"

@injectable()
export default class ConversationService implements IConversationService {

    constructor(
      @inject("IConversationRepository") private _conversationRepository:IConversationRepository,

    ){

    }

 async createOrGetConversation(userIds: string[]): Promise<IConversation> {
    if (!userIds || userIds.length !== 2) {
      throw new Error("Exactly two user IDs are required");
    };

    console.log('userIds.....',userIds);
    const existing = await this._conversationRepository.findConversationByMembers(userIds);

    console.log("existin conversation is ",existing);
    if (existing) return existing;
    return await this._conversationRepository.createConversation(userIds);
  }

  async getUserConversations(userId: string,from:string): Promise<IConversation[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return await this._conversationRepository.getUserConversations(userId,from);
  }

}