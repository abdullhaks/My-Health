
import { inject, injectable } from "inversify";
import IAdminUserService from "../interfaces/IAdminUserService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";


@injectable()
export default class AdminUserService implements IAdminUserService {

    constructor(@inject("IAdminRepository") private _adminRepository:IAdminRepository){

    }


    async getUsers(): Promise<any> {


    }

}