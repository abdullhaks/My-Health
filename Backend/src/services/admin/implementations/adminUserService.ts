
import { inject, injectable } from "inversify";
import IAdminUserService from "../interfaces/IAdminUserService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import {IUser, IUserDocument} from '../../../dto/userDTO'


@injectable()
export default class AdminUserService implements IAdminUserService {

    constructor(
        @inject("IAdminRepository") private _adminRepository:IAdminRepository,
        @inject("IUserRepository") private _userRepository: IUserRepository
){

    }
    async getUsers(page:number,search:string | undefined,limit:number): Promise<{users:IUserDocument[],totalPages:number}> {

        const response =await this._userRepository.getUsers(page,search,limit)
        return response

    };

    async block(id:string):Promise<IUserDocument| null>{
            
            console.log("id from block....",id);
            const response = await this._userRepository.blockUser(id)

            console.log("blocked result is ",response);
            
            return response; 

    };

    async unblock(id:string):Promise<IUserDocument| null>{
            
        console.log("id from block....",id);
        const response = await this._userRepository.unblockUser(id)

        console.log("blocked result is ",response);
        
        return response; 

    };


}