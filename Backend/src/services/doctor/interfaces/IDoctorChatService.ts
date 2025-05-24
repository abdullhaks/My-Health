

export default interface IDoctorChatService {
    
createOrGetConversation(userIds: string[]):Promise<any>;
getUserConversations(userId: string):Promise<any>;
sendMessage(conversationId: string, senderId: string, text: string):Promise<any>
getMessages(conversationId: string):Promise<any>;
markMessagesAsSeen(conversationId: string, userId: string):Promise<any>;

}