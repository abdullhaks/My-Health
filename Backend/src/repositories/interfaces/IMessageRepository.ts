import BaseRepository from "../implementations/baseRepository";
import { IMessageDocument } from "../../entities/messageEntities"; 


export default interface IMessageRepository extends BaseRepository<IMessageDocument>{

    createMessage(data: Partial<IMessageDocument>): Promise<IMessageDocument>
    getMessagesByConversation(conversationId: string): Promise<IMessageDocument[]> 
    markMessagesAsSeen(conversationId: string, userId: string): Promise<void>

};