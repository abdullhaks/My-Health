

export default interface IConversationService {
    
createOrGetConversation(userIds: string[]):Promise<any>;
getUserConversations(userId: string,from:string):Promise<any>;

}