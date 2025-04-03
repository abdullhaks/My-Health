import { injectable , inject } from "inversify";
import userModel from "../../models/userModel";
import { IUserDocument } from "../../entities/userEntities";
import BaseRepository from "./baseRepository";
import IUserRepository from "../interfaces/IUserRepository";

@injectable()

export default class UserRepository extends BaseRepository<IUserDocument> implements IUserRepository{

    constructor(@inject("userModel") private _userModel:any){
        super(_userModel);
    }

    async findByEmail ( email:string):Promise<IUserDocument>{
        try{

            const user =await this._userModel.findOne({email:email});
            return user

        }catch(error){
            console.log(error);
            throw new Error("Fialed to find user with this email");
        }
    };


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





}