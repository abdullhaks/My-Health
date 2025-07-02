

export default interface IMessageService {
    
    sendMessage(conversationId: string, senderId: string, text: string,type:string):Promise<any>
    getMessages(conversationId: string):Promise<any>;
    markMessagesAsSeen(conversationId: string, userId: string):Promise<any>;
    
}