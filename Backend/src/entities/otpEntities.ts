import { Document,Types } from "mongoose";

export interface IOtpDocument extends Document{
    
  _id: Types.ObjectId 
  email: String;
  otp: String;
  createdAt: Date;
  updatedAt: Date;

  };


