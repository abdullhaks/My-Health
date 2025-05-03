import { inject, injectable } from "inversify";
import IAdminDoctorService from "../interfaces/IAdminDoctorService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";


@injectable()
export default class AdminDoctorService implements IAdminDoctorService {

    constructor(@inject("IAdminRepository") private _adminRepository:IAdminRepository){

    }


    async getDoctors(page:number,search:string | undefined,limit:number): Promise<any> {

        const response =await this._adminRepository.getDoctors(page,search,limit)

        if(!response){
            throw new Error ("doctors not found..!")
        };

        return response

    };

    async getDoctor(id:string):Promise<any>{
        const response = await this._adminRepository.getDoctor(id);
        if(!response){
            throw new Error ("doctor not found..!")

        };

        return response;
    }

    async verifyDoctor(id:string):Promise<any>{
        const response = await this._adminRepository.verifyDoctor(id);

        if(!response){
            throw new Error ("doctor verifying failed");
        };
        return response;
    }


    async declineDoctor(id:string):Promise<any>{
        const response = await this._adminRepository.declineDoctor(id);

        if(!response){
            throw new Error ("doctor verifying failed");
        };
        return response;
    }

}