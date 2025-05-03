import BaseRepository from "../implementations/baseRepository";
import { IAdminDocument } from "../../entities/adminEntities";



export default interface IAdminRepository extends BaseRepository<IAdminDocument>{

    findByEmail(email:string):Promise<IAdminDocument>;
    getUsers (page:number,search:string | undefined,limit:number):Promise<any>
    getDoctors(page: number, search: string | undefined, limit: number): Promise<any>
    blockUser(id:string):Promise<any>
    unblockUser(id:string):Promise<any>
    getDoctor(id:string):Promise<any>
    blockUser(id:string):Promise<any>
    unblockUser(id:string):Promise<any>
    verifyDoctor(id:string):Promise<any>
    declineDoctor(id:string):Promise<any>
} 