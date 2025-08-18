import {Request , Response} from "express";
import IDoctorDashboardCtrl from "../interfaces/IDoctorDashboardCtrl";
import IDoctorDashboardService from "../../../services/doctor/interfaces/IDoctorDashboardService";
import {inject,injectable} from "inversify";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()
export default class DoctorDashboardController implements IDoctorDashboardCtrl{

    constructor(
        @inject("IDoctorDashboardService") private _dashboardService : IDoctorDashboardService
    ){}


   async getDashboardContent(req: Request, res: Response): Promise<void> {

    
    try {
   
      const {doctorId} = req.query;

      if (!doctorId) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'bad request , doctor id missed' });
              return;
        }

      const response = await this._dashboardService.getDashboardContent(doctorId.toString());
      if (!response) {
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

