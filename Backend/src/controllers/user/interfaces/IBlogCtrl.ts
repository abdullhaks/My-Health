import { Request,Response } from "express";


export default interface IUserBlogController {

    
    getBlogs(req:Request,res:Response):Promise<void>
   

    
};

