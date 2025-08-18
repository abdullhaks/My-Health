import { Document } from "mongoose";
import { Types } from "mongoose";



export interface ILocation {
    type: "Point";
    coordinates:[number,number];
    text:string;
}

// src/dto/userDTO.ts

// Request DTOs (from client to API)
export interface UserLoginRequestDTO {
  email: string;
  password: string;
}

export interface UserSignupRequestDTO {
  fullName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

// Response DTOs (from API to client)
export interface UserResponseDTO {
    _id:string;
    fullName:string;
    email:string;
    profile:string;
    phone:string;
    location:ILocation;
    gender:string;
    dob: string;
    isBlocked:boolean;
    isVerified:boolean;
    bmi:string;
    medicalTags:string;
    latestHealthSummary:string;
    walletBalance:number;
    tags:string[];
    createdAt:Date;
    updatedAt:Date
}

export interface AuthResponseDTO {
  message: string;
  user: Partial<UserResponseDTO>;
  accessToken?: string;
  refreshToken?: string;
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
    dob: string;
    isBlocked:boolean;
    isVerified:boolean;
    bmi:string;
    medicalTags:string;
    latestHealthSummary:string;
    walletBalance:number;
    tags:string[];
    createdAt:Date;
    updatedAt:Date

}

export interface IUser extends IUserDocument{}; 
export interface IUserResponse {
    message: string;
    user: Partial<IUser>;
    updatedUser: Partial<IUser>;
    accessToken:string;
    refreshToken:string;
    email:string;
}




