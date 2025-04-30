
import { inject, injectable } from "inversify";
import IAdminDoctorService from "../interfaces/IAdminDoctorService";
import IAdminRepository from "../../../repositories/interfaces/IAdminRepository";


@injectable()
export default class AdminDoctorService implements IAdminDoctorService {

    constructor(@inject("IAdminRepository") private _adminRepository:IAdminRepository){

    }


    async getDoctors(): Promise<any> {

        

    }

}