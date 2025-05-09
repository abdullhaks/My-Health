import BaseRepository from "../implementations/baseRepository";
import { IUserDocument } from "../../entities/userEntities";



export default interface IUserRepository extends BaseRepository<IUserDocument>{

    findByEmail(email:string):Promise<IUserDocument>;
    create(userData:IUserDocument):Promise<IUserDocument>;
    findLatestOtpByEmail(email: string): Promise<any>;
    verifyUser(email:string):Promise<IUserDocument>;
} 