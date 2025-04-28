import { Document,Types } from "mongoose";



export interface ILocation {
    type: "Point";
    coordinates:[number,number];
    text:string;
};

export interface ISpecializations{
    title:string;
    certificate:string;
}
export interface IDoctorDocument extends Document{

    _id:Types.ObjectId;
    fullName:string;
    email:string;
    password:string;
    profile:string;
    phone:string;
    location:ILocation;
    gender:string;
    dob:string;
    isBlocked:boolean;
    isVerified:boolean;
    adminVerified:number;
    rejectionReason:string;
    graduation:string;
    graduationCertificate:string;
    category:string;
    registerNo:string;
    registrationCertificate:string;
    experience:number;
    specializations:ISpecializations[];
    verificationId:string;
    walletBalance:number;
    createdAt:Date;
    updatedAt:Date

}

export interface IDoctor extends IDoctorDocument{}; 