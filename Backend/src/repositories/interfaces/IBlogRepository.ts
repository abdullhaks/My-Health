import BaseRepository from "../implementations/baseRepository";
import { IBlogDocument } from "../../entities/blogEntities";


export default interface IBlogRepository extends BaseRepository<IBlogDocument>{
getBlogs(authorId:string,pageNumber: number,limitNumber: number): Promise<any>,
    

}