import { inject,injectable } from "inversify";
import { Request,Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IDoctorBlogController from "../../doctor/interfaces/IBlogCtrl";
import IDoctorBlogService from "../../../services/doctor/interfaces/IDoctorBlogServices";

@injectable()
export default class DoctorBlogController implements IDoctorBlogController  {
    constructor(
       @inject("IDoctorBlogService") private _blogService:IDoctorBlogService
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

      const response = await this._blogService.createBlog(blogData);
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
      res.status(HttpStatusCode.BAD_REQUEST).json({ message: "blog posting failed" });
        return;
    }

    const response = await this._blogService.getBLogs(authorId?.toString(),pageNumber,limitNumber);
    if(!response){
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: "blog posting failed" });
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
        
    }
    
    
    async deleteBlog(req: Request, res: Response): Promise<void> {
        
    }
}