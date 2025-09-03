import BaseRepository from "../implementations/baseRepository";
import { IUserDocument } from "../../entities/userEntities";
import { PipelineStage } from "mongoose";



export default interface IUserRepository extends BaseRepository<IUserDocument>{
    aggregate<T = IUserDocument>(pipeline:PipelineStage[]): Promise<T[]>;
    findByEmail(email:string):Promise<IUserDocument | null>;
    getUsers(page: number, search: string | undefined, limit: number): Promise<{users:IUserDocument[],totalPages:number}>;
    blockUser(id:string):Promise<IUserDocument | null>;
    unblockUser(id:string):Promise<IUserDocument | null>

    create(userData:IUserDocument):Promise<IUserDocument>;
    verifyUser(email:string):Promise<IUserDocument | null>;
} 