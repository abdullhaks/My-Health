import { injectable , inject } from "inversify";
import adminModel from "../../models/adminModel";
import { IAdminDocument } from "../../entities/adminEntities";
import BaseRepository from "./baseRepository";
import IAdminRepository from "../interfaces/IAdminRepository";
import { truncates } from "bcryptjs";

@injectable()

export default class AdminRepository extends BaseRepository<IAdminDocument> implements IAdminRepository{

    constructor(
        @inject("adminModel") private _adminModel: any,
        @inject("userModel") private _userModel: any,
        @inject("doctorModel") private _doctorModel:any
    ) {
        super(_adminModel);
    }

    async findByEmail ( email:string):Promise<IAdminDocument>{
        try{

            const admin =await this._adminModel.findOne({email:email});
            return admin

        }catch(error){
            console.log(error);
            throw new Error("Fialed to find user with this email");
        }
    };


    async getUsers(page: number, search: string | undefined, limit: number): Promise<any> {
        try {
            const query: any = {};

            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }

            const skip = (page - 1) * limit;

            const users = await this._userModel
                .find(query)
                .skip(skip)
                .limit(limit);

                const total = await this._userModel.countDocuments(query);
            return {
                users,
                totalPages: Math.ceil(total / limit),
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch users");
        }
    };


    async getDoctors(page: number, search: string | undefined, limit: number): Promise<any> {
        try {
            const query: any = {};

            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }

            const skip = (page - 1) * limit;

            const doctors = await this._doctorModel
                .find(query)
                .skip(skip)
                .limit(limit);

                const total = await this._doctorModel.countDocuments(query);
            return {
                doctors,
                totalPages: Math.ceil(total / limit),
            };
         
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch doctors");
        }
    };

    async blockUser(id:string):Promise<any>{
        try{

            const resp =await this._userModel.findByIdAndUpdate(id, {isBlocked:true}, { new: true });
            console.log("resp form repo....",resp);
            return resp;


        }catch(error){
            console.log(error);
            throw new Error("user blockig has beeb failed")
        }
    };


    async unblockUser(id:string):Promise<any>{
        try{

            const resp =await this._userModel.findByIdAndUpdate(id, {isBlocked:false}, { new: true });
            console.log("resp form repo....",resp);
            return resp;

        }catch(error){
            console.log(error);
            throw new Error("user blockig has beeb failed")
        }
    }

}