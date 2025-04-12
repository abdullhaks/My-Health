import { Document,Types } from "mongoose";



export interface ILocation {
    type: "Point";
    coordinates:[number,number];
}
export interface IUserDocument extends Document{

    _id:Types.ObjectId;
    fullName:string;
    email:string;
    password:string;
    profile:string;
    phone:string;
    location:ILocation;
    gender:string;
    dob:Date;
    isBlocked:boolean;
    isVerified:boolean;
    bmi:string;
    latestHealthSummary:string;
    walletBalance:number;
    tags:string[];
    createdAt:Date;
    updatedAt:Date

}

export interface IUser extends IUserDocument{}; 