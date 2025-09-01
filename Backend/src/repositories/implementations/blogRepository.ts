import BaseRepository from "./baseRepository";
import { inject,injectable } from "inversify";
import { IBlogDocument } from "../../entities/blogEntities";
import IBlogRepository from "../interfaces/IBlogRepository";



@injectable()
export default class BlogsRepository extends BaseRepository<IBlogDocument> implements IBlogRepository{

    constructor(
        @inject("blogModel") private _blogModel:any
    ){

        super(_blogModel)

    }

    async getBlogs(authorId:string,pageNumber: number,limitNumber: number):  Promise<{ blogs: IBlogDocument[]; totalPages: number }>  {
        try {
            const query: any = {authorId:authorId};

            const skip = (pageNumber - 1) * limitNumber;

            const blogs = await this._blogModel
                .find(query)
                .skip(skip)
                .limit(limitNumber);

                const total = await this._blogModel.countDocuments(query);
            return {
                blogs,
                totalPages: Math.ceil(total / limitNumber),
            };
        } catch (error) {
            console.log(error);
            throw new Error("Failed to fetch users");
        }
    };


    async getBlogsWithSearch(search: string, pageNumber: number, limitNumber: number): Promise<{ blogs: IBlogDocument[]; totalPages: number }> {
    try {
      const query: any = search
        ? { title: { $regex: search, $options: 'i' } } // Case-insensitive search on title
        : {};

      const skip = (pageNumber - 1) * limitNumber;

      const blogs = await this._blogModel
        .find(query)
        .skip(skip)
        .limit(limitNumber)
        .lean(); // Use lean() for better performance

      const total = await this._blogModel.countDocuments(query);
      return {
        blogs,
        totalPages: Math.ceil(total / limitNumber),
      };
    } catch (error) {
      console.error('Error fetching blogs:', error);
      throw new Error('Failed to fetch blogs');
    }
  }



  async getBlogsByTimePeriod(startDate: Date): Promise<IBlogDocument[]> {
    try {
      const blogs = await this._blogModel
        .find({ createdAt: { $gte: startDate } })
        .limit(3) // Limit to 3 blogs for dashboard
        .lean();
      return blogs;
    } catch (error) {
      console.error('Error fetching blogs by time period:', error);
      throw new Error('Failed to fetch blogs');
    }
  }

}