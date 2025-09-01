import { IBlog } from "../../../dto/blogDto"
export default interface IDoctorBlogService {

    createBlog(blogData:any):Promise<IBlog>
    getBLogs(authorId:string,pageNumber:number,limitNumber:number):Promise<{ blogs: IBlog[]; totalPages: number }> 
    updateBLog(blogId:string,blogData:object):Promise<IBlog | null>

}
