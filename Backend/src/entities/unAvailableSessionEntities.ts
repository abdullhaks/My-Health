import { Document,Types } from "mongoose";

export interface IUnAvailableSessionDocument extends Document{
    
  _id: Types.ObjectId 
  doctorId: String;
  sessionId: String;
  day: Date;
  createdAt: Date;
  updatedAt: Date;

  };


