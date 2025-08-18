import { inject,injectable } from "inversify";
import { Request,Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IDoctorBlogCtrl from "../interfaces/IDoctorBlogCtrl";
import IDoctorBlogService from "../../../services/doctor/interfaces/IDoctorBlogServices";

@injectable()
export default class DoctorBlogController implements IDoctorBlogCtrl  {
    constructor(
       @inject("IDoctorBlogService") private _doctorBlogService:IDoctorBlogService
    ){
      
    };

   async createBlog(req: Request, res: Response): Promise<void> {

    try {
      console.log("Request body:", req.body);
      console.log("Request body keys:", Object.keys(req.body));

      // Since FormData fields are parsed into req.body as an object
      const { title, content, author,authorId, thumbnail, img1, img2, img3, tags } = req.body;

      if (!title || !content || !tags || !author) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Missing required fields: title, content,tags and author are required",
        });
        return;
      }

   
      const blogData = {
        title,
        content,
        author,
        authorId,
        thumbnail,
        img1: img1 || "",
        img2: img2 || "",
        img3: img3 || "",
        tags: tags,
      };

      console.log("Blog data to save:", blogData);

      const response = await this._doctorBlogService.createBlog(blogData);
      if(!response){
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "blog posting failed" });
        return;
      }
      res.status(HttpStatusCode.CREATED).json({
        message: "Blog created successfully",
        data: blogData,
      });
    } catch (err) {
      console.error("Error creating blog:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Failed to create blog" });
    }
  };


  async getBlogs(req: Request, res: Response): Promise<void> {

    try{
      const {authorId,page,limit} = req.query;
    const pageNumber = page ? parseInt(page as string, 10) : 1;
    const limitNumber = limit ? parseInt(limit as string, 10) : 10;

    if(!authorId){
      res.status(HttpStatusCode.BAD_REQUEST).json({ message: "blog fetching failed" });
        return;
    }

    const response = await this._doctorBlogService.getBLogs(authorId?.toString(),pageNumber,limitNumber);
    if(!response){
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "blog fetching failed" });
        return;
      };

      res.status(HttpStatusCode.OK).json({
        message: "Blogs fetched successfully",
        data: response,
      });

    }catch(err){

      console.error("Error fetching blogs:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Failed to fetch blogs" });

    }

  
  };

    
    async updateBlog(req: Request, res: Response): Promise<void> {

      try {
      
      const { title, content, author,authorId, thumbnail, img1, img2, img3, tags } = req.body.blogData;
      const {blogId} = req.body;

      if (!title || !content || !tags || !author) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          message: "Missing required fields: title, content,tags and author are required",
        });
        return;
      }

   
      const blogData = {
        title,
        content,
        author,
        authorId,
        thumbnail,
        img1: img1 || "",
        img2: img2 || "",
        img3: img3 || "",
        tags: tags,
      };

      console.log("Blog data to update......:", blogData);

      const response = await this._doctorBlogService.updateBLog(blogId,blogData);

      if(!response){
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "blog updating failed" });
        return;
      }
      res.status(HttpStatusCode.OK).json({
        message: "Blog updated successfully",
        data: blogData,
      });
    } catch (err) {
      console.error("Error creating blog:", err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: "Failed to update blog" });
    }

        
    }
    
    
    async deleteBlog(req: Request, res: Response): Promise<void> {
        
    }
}