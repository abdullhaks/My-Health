import { IBlog } from "../../../dto/blogDto";
export default interface IUserBlogService {


    getBlogs(search: string, pageNumber: number, limitNumber: number): Promise<{ blogs: IBlog[]; totalPages: number }>

}
