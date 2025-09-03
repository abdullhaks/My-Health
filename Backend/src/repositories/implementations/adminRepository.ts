import { injectable , inject } from "inversify";
import { IAdminDocument } from "../../entities/adminEntities";
import BaseRepository from "./baseRepository";
import IAdminRepository from "../interfaces/IAdminRepository";
import { Model } from "mongoose";



@injectable()

export default class AdminRepository extends BaseRepository<IAdminDocument> implements IAdminRepository{

    constructor(
        @inject("adminModel") private _adminModel: Model<IAdminDocument>
      
    ) {
        super(_adminModel);
    }

    async findByEmail ( email:string):Promise<IAdminDocument | null>{
        try{

            const admin =await this._adminModel.findOne({email:email});
            return admin

        }catch(error){
            console.log(error);
            throw new Error("Fialed to find user with this email");
        }
    };


   

}