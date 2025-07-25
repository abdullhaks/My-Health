import {Document,Types} from "mongoose"

export  interface INotificationDocument extends Document {

    _id:Types.ObjectId;
    userId:string;
    date:Date;
    message:string;
    isRead:boolean;
    mention:string;
    link:string;
    type:string;
    createdAt: Date;

};