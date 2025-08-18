import { inject,injectable } from "inversify";
import { Request,Response } from "express";
import { HttpStatusCode } from "../../../utils/enum";
import IUserBlogCtrl from "../interfaces/IUserBlogCtrl";
import IUserBlogService from "../../../services/user/interfaces/IUserBlogServices";

@injectable()
export default class UserBlogController implements IUserBlogCtrl  {
    constructor(
       @inject("IUserBlogService") private _blogService:IUserBlogService
    ){
      
    };

  

  async getBlogs(req: Request, res: Response): Promise<void> {
    try {
      const { search = '', page = '1', limit = '10' } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);

      if (isNaN(pageNumber) || isNaN(limitNumber)) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid page or limit parameters' });
        return;
      }

      const response = await this._blogService.getBlogs(search.toString(), pageNumber, limitNumber);
      if (!response || !response.blogs) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No blogs found' });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        message: 'Blogs fetched successfully',
        data: response,
      });
    } catch (err) {
      console.error('Error fetching blogs:', err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to fetch blogs',
      });
    }
  }



    
   
}