import {Request , Response} from "express";
import IUserDashboardController from "../interfaces/IDashboardCtrl";
import {inject,injectable} from "inversify";
import IUserDashboardService from "../../../services/user/interfaces/IUserDashboardService";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()
export default class UserDashboardController implements IUserDashboardController{

    constructor(
        @inject("IUserDashboardService") private _dashboardService : IUserDashboardService
    ){}


   async getDashboardContent(req: Request, res: Response): Promise<void> {

    
    try {
      const { days = '30' } = req.query;
      const daysNumber = parseInt(days as string, 10);

      if (isNaN(daysNumber) || daysNumber < 1) {
        res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'Invalid days parameter' });
        return;
      }

      const response = await this._dashboardService.getDashboardContent(daysNumber);
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

