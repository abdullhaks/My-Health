import { Document,Types } from "mongoose";

export interface IUnAvailableDayDocument extends Document{
    
  _id: Types.ObjectId 
  doctorId: String;
  day: String;
  createdAt: Date;
  updatedAt: Date;

  };


