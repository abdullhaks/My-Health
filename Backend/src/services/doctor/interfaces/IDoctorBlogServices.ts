
export default interface IDoctorBlogService {

    createBlog(blogData:any):Promise<any>
    getBLogs(authorId:string,pageNumber:number,limitNumber:number):Promise<any>

}
