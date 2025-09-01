import {inject,injectable} from "inversify";
import IUserDashboardService from "../interfaces/IUserDashboardService";
import IBlogRepository from "../../../repositories/interfaces/IBlogRepository";
import IAdvertisementRepository from "../../../repositories/interfaces/IAdvertisementRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IBlog } from "../../../dto/blogDto";
import { IAdvertisement } from "../../../dto/advertisementDto";

@injectable()
export default class UserDashboardService implements IUserDashboardService {

    constructor(
        @inject('IBlogRepository') private _blogRepository: IBlogRepository,
        @inject('IAdvertisementRepository') private _advertisementRepository: IAdvertisementRepository,
        @inject('IUserRepository') private _userRepository : IUserRepository,
    ){}


    async getDashboardContent(days: number,userId:string,latitude:number,longitude:number): Promise<{
    blogs: IBlog[];
    advertisements: IAdvertisement[];
  }> {

    try {

      

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let user = await this._userRepository.findOne({_id:userId});
     

      if (!user) {
        throw new Error(`User with id ${userId} not found`);
      }

      const blogs = await this._blogRepository.getBlogsByTimePeriod(startDate);
      const advertisements = await this._advertisementRepository.getAdvertisementsByTimePeriodAndTags(startDate, user.tags,latitude,longitude);

      return { blogs, advertisements };
      

    } catch (error) {
      console.error('Error in getDashboardContent:', error);
      throw new Error('Failed to fetch dashboard content');
    }
  }

}