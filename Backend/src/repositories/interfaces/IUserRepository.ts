import BaseRepository from "../implementations/baseRepository";
import { IUserDocument } from "../../entities/userEntities";



export default interface IUserRepository extends BaseRepository<IUserDocument>{
    aggregate(pipeline: ({ $match: { createdAt: { $gte: Date; $lte: Date; }; }; } | { $group: { _id: { [x: string]: string; }; count: { $sum: number; }; }; } | { $sort: { _id: number; }; } | { $project: { name: string; value: string;}; })[]): unknown;
    findByEmail(email:string):Promise<IUserDocument>;
    getUsers(page: number, search: string | undefined, limit: number): Promise<any>;
    blockUser(id:string):Promise<any>;
    unblockUser(id:string):Promise<any>

    create(userData:IUserDocument):Promise<IUserDocument>;
    findLatestOtpByEmail(email: string): Promise<any>;
    verifyUser(email:string):Promise<IUserDocument>;
} 