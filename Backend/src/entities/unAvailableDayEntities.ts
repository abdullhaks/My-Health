import { Document,Types } from "mongoose";

export interface IUnAvailableDayDocument extends Document{
    
  _id: Types.ObjectId 
  doctorId: String;
  day: Date;
  createdAt: Date;
  updatedAt: Date;

  };


