import { IConversation } from "../../../dto/conversationDTO";
import {IMessage} from "../../../dto/messageDTO"


export default interface IDoctorChatService {
    
createOrGetConversation(userIds: string[]):Promise<IConversation>;
getUserConversations(userId: string):Promise<IConversation[]>;
sendMessage(conversationId: string, senderId: string, text: string):Promise<IMessage>
getMessages(conversationId: string):Promise<IMessage[]>;
markMessagesAsSeen(conversationId: string, userId: string):Promise<void>;

}