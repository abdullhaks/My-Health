import { injectable , inject } from "inversify";
import userModel from "../../models/user";
import OtpModel from "../../models/otp";
import { IUserDocument } from "../../entities/userEntities";
import BaseRepository from "./baseRepository";
import IUserRepository from "../interfaces/IUserRepository";
import { FilterQuery, Model } from "mongoose";
import { PipelineStage } from "mongoose";



@injectable()

export default class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository{

    constructor(
        @inject("userModel") private _userModel: Model<IUserDocument>,
    ) {
        super(_userModel);
    }

    async findByEmail ( email:string):Promise<IUserDocument | null>{
        try{

            const user =await this._userModel.findOne({email:email});
            return user

        }catch(error){
            console.log(error);
            throw new Error("Fialed to find user with this email");
        }
    };


     async getUsers(page: number, search: string | undefined, limit: number): Promise<{users:IUserDocument[],totalPages:number}> {
        try {
            const query: FilterQuery<IUserDocument> = {};
            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }
            const skip = (page - 1) * limit;
            const users = await this._userModel.find(query).skip(skip).limit(limit);
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


    async blockUser(id:string):Promise<IUserDocument | null>{
        try{
            const resp =await this._userModel.findByIdAndUpdate(id, {isBlocked:true}, { new: true });
            console.log("resp form repo....",resp);
            return resp;
        }catch(error){
            console.log(error);
            throw new Error("user blockig has beeb failed")
        }
    };


    async unblockUser(id:string):Promise<IUserDocument | null>{
        try{
            const resp =await this._userModel.findByIdAndUpdate(id, {isBlocked:false}, { new: true });
            console.log("resp form repo....",resp);
            return resp;
        }catch(error){
            console.log(error);
            throw new Error("user blockig has beeb failed")
        }
    }



    async create(userData : IUserDocument):Promise<IUserDocument>{
        try{
            
        const user = await this._userModel.create(userData);
        return user;

        }catch(error){
            console.log(error);
            console.error("error in saving user data");
            throw new Error("Error in saving user data ");
        }
    }
    

    async verifyUser(email: string): Promise<IUserDocument | null> {
        try {
            const result = await this._userModel.findOneAndUpdate(
                { email },
                { $set: { isVerified: true } },
                { new: true } // returns updated document
            );
    
            if (!result) {
                throw new Error("User not found for verification.");
            }
    
            console.log("User verified successfully:", result);
            return result;
            
        } catch (error) {
            console.error("Error verifying user:", error);
            throw new Error("Failed to verify user with this email.");
        }
    }
    
    async aggregate<T = IUserDocument>(pipeline: PipelineStage[]): Promise<T[]> {
    try {
        const resp = await this._userModel.aggregate(pipeline);
        console.log("pipe line is .....",pipeline)
        console.log("resp is .....",resp)
      return resp;

    } catch (error) {
      console.error("Error in aggregate:", error);
      throw new Error("Failed to perform aggregation");
    }
  }

}