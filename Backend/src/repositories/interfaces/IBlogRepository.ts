import BaseRepository from "../implementations/baseRepository";
import { IBlogDocument } from "../../entities/blogEntities";


export default interface IBlogRepository extends BaseRepository<IBlogDocument>{
getBlogs(authorId:string,pageNumber: number,limitNumber: number):  Promise<{ blogs: IBlogDocument[]; totalPages: number }> ,
getBlogsWithSearch(search: string, pageNumber: number, limitNumber: number): Promise<{ blogs: IBlogDocument[]; totalPages: number }>
getBlogsByTimePeriod(startDate: Date):Promise<IBlogDocument[]>    

}