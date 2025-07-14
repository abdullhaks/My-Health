
import { inject, injectable } from "inversify";
import IAdminUserService from "../interfaces/IAdminUserService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import {IUser} from '../../../dto/userDTO'


@injectable()
export default class AdminUserService implements IAdminUserService {

    constructor(@inject("IAdminRepository") private _adminRepository:IAdminRepository){

    }
    async getUsers(page:number,search:string | undefined,limit:number): Promise<IUser[]> {

        const response =await this._adminRepository.getUsers(page,search,limit)
        return response

    };

    async block(id:string):Promise<IUser>{
            
            console.log("id from block....",id);
            const response = await this._adminRepository.blockUser(id)

            console.log("blocked result is ",response);
            
            return response; 

    };

    async unblock(id:string):Promise<IUser>{
            
        console.log("id from block....",id);
        const response = await this._adminRepository.unblockUser(id)

        console.log("blocked result is ",response);
        
        return response; 

    };


}