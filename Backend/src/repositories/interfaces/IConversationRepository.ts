import BaseRepository from "../implementations/baseRepository";
import { IConversationDocument } from "../../entities/conversationEntities"; 


export default interface IConversationRepository extends BaseRepository<IConversationDocument>{

    createConversation(members: string[]): Promise<IConversationDocument>
    findConversationByMembers(members: string[]): Promise<IConversationDocument | null>
    getUserConversations(userId: string): Promise<IConversationDocument[]>
    
}