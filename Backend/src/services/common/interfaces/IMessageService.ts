import {IMessage} from "../../../dto/messageDTO";


export default interface IMessageService {
    
    sendMessage(conversationId: string, senderId: string, text: string,type:string):Promise<IMessage>
    getMessages(conversationId: string):Promise<IMessage[]>;
    markMessagesAsSeen(conversationId: string, userId: string):Promise<void>;
    
}