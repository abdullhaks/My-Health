import { Document,Types } from "mongoose";



export interface IAdminDocument extends Document{

    _id:Types.ObjectId;
    fullName:string;
    email:string;
    password:string;
    profile:string;
    createdAt:Date;
    updatedAt:Date

}