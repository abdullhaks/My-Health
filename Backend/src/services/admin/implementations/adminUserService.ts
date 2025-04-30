
import { inject, injectable } from "inversify";
import IAdminUserService from "../interfaces/IAdminUserService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";
import { response } from "express";


@injectable()
export default class AdminUserService implements IAdminUserService {

    constructor(@inject("IAdminRepository") private _adminRepository:IAdminRepository){

    }
    async getUsers(page:number,search:string | undefined,limit:number): Promise<any> {

        const response =await this._adminRepository.getUsers(page,search,limit)

        if(!response){
            throw new Error ("users not found..!")
        };

        return response

    }

}