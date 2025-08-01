import {inject,injectable} from "inversify";
import IUserDashboardService from "../interfaces/IUserDashboardService";
import IBlogRepository from "../../../repositories/interfaces/IBlogRepository";
import IAdvertisementRepository from "../../../repositories/interfaces/IAdvertisementRepository";
import { IBlogDocument } from "../../../entities/blogEntities";
import { IAdvertisementDocument } from "../../../entities/advertisementEntitites";


@injectable()
export default class UserDashboardService implements IUserDashboardService {

    constructor(
        @inject('IBlogRepository') private _blogRepository: IBlogRepository,
        @inject('IAdvertisementRepository') private _advertisementRepository: IAdvertisementRepository
    ){}


    async getDashboardContent(days: number): Promise<{
    blogs: IBlogDocument[];
    advertisements: IAdvertisementDocument[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const blogs = await this._blogRepository.getBlogsByTimePeriod(startDate);
      const advertisements = await this._advertisementRepository.getAdvertisementsByTimePeriod(startDate);

      console.log("blogs are................",blogs);
      console.log("advertisements are................",advertisements);
      

      return { blogs, advertisements };
    } catch (error) {
      console.error('Error in getDashboardContent:', error);
      throw new Error('Failed to fetch dashboard content');
    }
  }

}