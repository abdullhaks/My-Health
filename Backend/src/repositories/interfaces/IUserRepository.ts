import BaseRepository from "../implementations/baseRepository";
import { IUserDocument } from "../../entities/userEntities";



export default interface IUserRepository extends BaseRepository<IUserDocument>{
    aggregate(pipeline: ({ $match: { createdAt: { $gte: Date; $lte: Date; }; }; } | { $group: { _id: { [x: string]: string; }; count: { $sum: number; }; }; } | { $sort: { _id: number; }; } | { $project: { name: string; value: string;}; })[]): unknown;
    findByEmail(email:string):Promise<IUserDocument>;
    create(userData:IUserDocument):Promise<IUserDocument>;
    findLatestOtpByEmail(email: string): Promise<any>;
    verifyUser(email:string):Promise<IUserDocument>;
} 