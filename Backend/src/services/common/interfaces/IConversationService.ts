import {IConversation} from "../../../dto/conversationDTO"


export default interface IConversationService {
    
createOrGetConversation(userIds: string[]):Promise<IConversation>;
getUserConversations(userId: string,from:string):Promise<IConversation[]>;

}