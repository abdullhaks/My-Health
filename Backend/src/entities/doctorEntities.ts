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
    doctor: unknown;

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
    premiumMembership:boolean;
    subscriptionId:string;
    adminVerified:number;
    rejectionReason:string;
    graduation:string;
    graduationCertificate:string;
    category:string;
    registerNo:string;
    registrationCertificate:string;
    experience:number;
    reportAnalysisFees:number;
    specializations:ISpecializations[];
    verificationId:string;
    walletBalance:number;
    bankAccNo?:string,
    bankAccHolderName?:string,
    bankIfscCode?:string,
    createdAt:Date;
    updatedAt:Date

}