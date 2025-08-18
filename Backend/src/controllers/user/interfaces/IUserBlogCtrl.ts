import { Request,Response } from "express";


export default interface IUserBlogCtrl {

    
    getBlogs(req:Request,res:Response):Promise<void>
   

    
};

