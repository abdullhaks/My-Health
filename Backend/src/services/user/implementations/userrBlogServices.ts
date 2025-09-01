import { inject,injectable } from "inversify";
import IUserBlogService from "../interfaces/IUserBlogServices";
import IBlogRepository from "../../../repositories/interfaces/IBlogRepository";
import { IBlog } from "../../../dto/blogDto";

@injectable()
export default class UserBlogService implements IUserBlogService {
    
    constructor(
        @inject("IBlogRepository")private _blogRepository:IBlogRepository
    ){};

    async getBlogs(search: string, pageNumber: number, limitNumber: number): Promise<{ blogs: IBlog[]; totalPages: number }> {
    try {
      const response = await this._blogRepository.getBlogsWithSearch(search, pageNumber, limitNumber);
      if (!response) {
        throw new Error('No blogs found');
      }
      return response;
    } catch (error) {
      console.error('Error in getBlogs:', error);
      throw error;
    }
  }



}