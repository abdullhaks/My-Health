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

// src/dto/userDTO.ts

// Request DTOs (from client to API)
export interface DoctorLoginRequestDTO {
  email: string;
  password: string;
}

export interface DoctorSignupRequestDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// Response DTOs (from API to client)
export interface DoctorResponseDTO {
        // doctor: unknown;
        _id:string;
        fullName:string;
        email:string;
        profile:string;
        phone:string;
        location:ILocation;
        gender:string;
        dob:string;
        isBlocked:boolean;
        isVerified:boolean;
        premiumMembership:boolean;
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

export interface AuthResponseDTO {
  message: string;
  doctor: Partial<DoctorResponseDTO>;
  accessToken?: string;
  refreshToken?: string;
};




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
    premiumMembership:boolean;
    adminVerified:number;
    rejectionReason:string;
    reportAnalysisFees:number;
    graduation:string;
    graduationCertificate:string;
    category:string;
    registerNo:string;
    registrationCertificate:string;
    experience:number;
    specializations:ISpecializations[];
    bankAccNo?:string;
    bankAccHolderName?:string;
    bankIfscCode?:string;
    verificationId:string;
    walletBalance:number;
    createdAt:Date;
    updatedAt:Date

}

export interface IDoctor extends IDoctorDocument{}; 

export interface doctorProfileUpdate {
  fullName: string;
  phone?: string;
  location?: ILocation | string;
  dob?: string;
  gender?: string;
  graduation?: string;
  category?: string;
  registerNo?: string;
  experience?: number;
  specializations?: ISpecializations[];
  bankAccNo?: string;
  bankAccHolderName?: string;
  bankIfscCode?: string;
}
