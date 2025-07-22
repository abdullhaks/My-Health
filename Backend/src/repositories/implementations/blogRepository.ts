import BaseRepository from "./baseRepository";
import { inject,injectable } from "inversify";
import { IBlogDocument } from "../../entities/blogEntities";



@injectable()
export default class BlogsRepository extends BaseRepository<IBlogDocument> {

    constructor(
        @inject("blogModel") private _blogModel:any
    ){

        super(_blogModel)

    }

    async getBlogs(authorId:string,pageNumber: number,limitNumber: number): Promise<any> {
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

}