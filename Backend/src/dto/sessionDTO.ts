import { Document,Types } from "mongoose";

export interface ISessionDocument extends Document{
_id: Types.ObjectId 
doctorId: Types.ObjectId | string 
dayOfWeek: Number 
startTime: String 
endTime: String 
duration: Number 
fee: Number 
rRule: String 
createdAt: Date
updatedAt: Date
};

export interface ISession extends ISessionDocument {};
