import { injectable, inject } from "inversify";
import { IConversationDocument } from "../../entities/conversationEntities";
import BaseRepository from "./baseRepository";
import IConversationRepository from "../interfaces/IConversationRepository";
import { getSignedImageURL } from "../../middlewares/common/uploadS3";

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

  async getUserConversations(userId: string,from:string): Promise<any[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const conversations = await this._conversationModel
      .find({ members: userId })
      .sort({ updatedAt: -1 })
      .populate({
        path: "members",
        select: "_id fullName profile",
        model: from,
      });

    // Await all avatar URLs before returning
    return Promise.all(
      conversations.map(async (conv: any) => ({
        _id: conv._id,
        members: await Promise.all(
          conv.members.map(async (member: any) => ({
            userId: member._id,
            name: member.fullName,
            avatar: await getSignedImageURL(member.profile),
          }))
        ),
      }))
    );
  };


  





}
