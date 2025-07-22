
  import { Document,Types } from "mongoose";
  
  export interface IBlogDocument extends Document{
  _id: Types.ObjectId 
  title: String 
  thumbnail:String
  content:String
  author:String
  authorId:String
  img1:String
  img2:String
  img3:String
  tags:String[]
  createdAt: Date
  updatedAt: Date
  };