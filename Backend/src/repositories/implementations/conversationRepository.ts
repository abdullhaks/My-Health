import { injectable, inject } from "inversify";
import { IConversationDocument } from "../../entities/conversationEntities";
import BaseRepository from "./baseRepository";
import IConversationRepository from "../interfaces/IConversationRepository";

@injectable()
export default class ConversationRepository
  extends BaseRepository<IConversationDocument>
  implements IConversationRepository
{
  constructor(@inject("conversationModel") private _conversationModel: any) {
    super(_conversationModel);
  }

  async createConversation(members: string[]): Promise<IConversationDocument> {
    if (!members || members.length !== 2) {
      throw new Error("Exactly two members are required");
    }
    return await this._conversationModel.create({ members, updatedAt: new Date() });
  }

  async findConversationByMembers(members: string[]): Promise<IConversationDocument | null> {
    if (!members || members.length !== 2) {
      throw new Error("Exactly two members are required");
    }
    return await this._conversationModel.findOne({
      members: { $all: members, $size: members.length },
    });
  }

  async getUserConversations(userId: string): Promise<IConversationDocument[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const conversations = await this._conversationModel
      .find({ members: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: "members",
        select: "_id fullName profile",
        model: "User",
      });
    return conversations.map((conv: any) => ({
      _id: conv._id,
      participants: conv.members.map((member: any) => ({
        userId: member._id,
        name: member.fullName,
        avatar: member.profile,
      })),
    }));
  }
}
