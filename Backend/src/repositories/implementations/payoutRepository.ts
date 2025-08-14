import BaseRepository from "./baseRepository";
import { inject,injectable } from "inversify";
import { IPayoutDocument } from "../../entities/payoutEntities";



@injectable()
export default class PayoutRepository extends BaseRepository<IPayoutDocument> {

    constructor(
        @inject("payoutModel") private _blogModel:any
    ){

        super(_blogModel)

    }

    async getBlogs(authorId:string,pageNumber: number,limitNumber: number): Promise<any> {
        try {
          
        } catch (error) {
            console.log(error);
        
        }
    };


}