import { Request,Response } from "express";


export default interface IDoctorBlogCtrl {

    createBlog(req:Request,res:Response):Promise<void>
    getBlogs(req:Request,res:Response):Promise<void>
    updateBlog(req:Request,res:Response):Promise<void>
    deleteBlog(req:Request,res:Response):Promise<void>

    
};

