import {Request , Response} from "express";
import IUserDashboardCtrl from "../interfaces/IUserDashboardCtrl";
import {inject,injectable} from "inversify";
import IUserDashboardService from "../../../services/user/interfaces/IUserDashboardService";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()
export default class UserDashboardController implements IUserDashboardCtrl{

    constructor(
        @inject("IUserDashboardService") private _dashboardService : IUserDashboardService
    ){}


   async getDashboardContent(req: Request, res: Response): Promise<void> {

    
    try {
      const { days = '30',userId,latitude=0,longitude=0} = req.query;
      const daysNumber = parseInt(days as string, 10);

        console.log("query is.......",req.query);

     
      if(latitude&&longitude){
        console.log("latitude,longitude........",latitude,longitude);
      }
     
      if(!userId){
        throw new Error ("credentials missed");
   
      }
        
      // const response1 = await this._dashboardService.getDashboardContent(daysNumber, userId.toString(),parseFloat(latitude as string),parseFloat(longitude as string));

      if (isNaN(daysNumber) || daysNumber < 1 || !userId) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Fetching Addvertisement failed' });
        return;
      }

      const response = await this._dashboardService.getDashboardContent(daysNumber,userId.toString(),parseFloat(latitude as string),parseFloat(longitude as string));
      if (!response || (!response.blogs && !response.advertisements)) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No content found' });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        message: 'Dashboard content fetched successfully',
        data: response,
      });
    } catch (err) {
      console.error('Error fetching dashboard content:', err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to fetch dashboard content',
      });
    }
  }


        
}

