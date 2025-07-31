
export default interface IUserBlogService {


    getBlogs(search: string, pageNumber: number, limitNumber: number): Promise<{ blogs: any[]; totalPages: number }>

}
