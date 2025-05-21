import {inject,injectable} from "inversify"
import IConversationService from "../interfaces/IConversationService";
import IConversationRepository from "../../../repositories/interfaces/IConversationRepository";

@injectable()
export default class ConversationService implements IConversationService {

    constructor(
      @inject("IConversationRepository") private _conversationRepository:IConversationRepository,

    ){

    }

async createOrGetConversation(doctorId: string[]) {
    const existing = await this._conversationRepository.findConversationByMembers(doctorId);
    if (existing) return existing;
    return await this._conversationRepository.createConversation(doctorId);
  }

  async getUserConversations(doctorId: string) {

    try{
    return await this._conversationRepository.getUserConversations(doctorId);

    }catch(error){
      console.error("Error geting conversations :", error);
      throw new Error("Failed fetch conversatoins");
    }
  }

}