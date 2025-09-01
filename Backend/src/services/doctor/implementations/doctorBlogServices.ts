import { inject,injectable } from "inversify";
import IDoctorBlogService from "../interfaces/IDoctorBlogServices";
import IBlogRepository from "../../../repositories/interfaces/IBlogRepository";
import { IBlog } from "../../../dto/blogDto";

@injectable()
export default class DoctorBlogService implements IDoctorBlogService {
    
    constructor(
        @inject("IBlogRepository")private _blogRepository:IBlogRepository
    ){};

    async createBlog(blogData: any): Promise<IBlog> {
        const response = await this._blogRepository.create(blogData);
        return response;
        
    };

    async getBLogs(authorId:string,pageNumber: number, limitNumber: number): Promise<{ blogs: IBlog[]; totalPages: number }> {
        
        const response = await this._blogRepository.getBlogs(authorId,pageNumber,limitNumber);
        console.log("blog response....",response)
        return response;
    };

    async updateBLog(blogId:string,blogData:object): Promise<IBlog | null> {
        const response = await this._blogRepository.update(blogId,blogData);
        return response;
        
    };



}