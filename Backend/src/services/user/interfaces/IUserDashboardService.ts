import { IAdvertisement } from "../../../dto/advertisementDto";
import { IBlog } from "../../../dto/blogDto";


export default interface IUserDashboardService {

    getDashboardContent(daysNumber:number,userId:string,latitude:number,longitude:number): Promise<{
        blogs: IBlog[];
        advertisements: IAdvertisement[];
      }>
    
}