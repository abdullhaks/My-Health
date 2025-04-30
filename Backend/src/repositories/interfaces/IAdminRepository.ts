import BaseRepository from "../implementations/baseRepository";
import { IAdminDocument } from "../../entities/adminEntities";



export default interface IAdminRepository extends BaseRepository<IAdminDocument>{

    findByEmail(email:string):Promise<IAdminDocument>;
    getUsers (page:number,search:string | undefined,limit:number):Promise<any>
} 