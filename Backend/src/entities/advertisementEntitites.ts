import { Document,Types } from "mongoose";

export interface IAdvertisementDocument extends Document {
    _id: Types.ObjectId;
    title:string;
    author:string;
    authorId:string;
    location:object;
    tags:Array<string>;
    videoUrl:string;
    pack:string;
    fee: Number ;
    views:Number;
    clicks:Number;
    expDate:Date;
    createdAt: Date;

}