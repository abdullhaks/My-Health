import {Request , Response} from "express";
import IDoctorDashboardCtrl from "../interfaces/IDoctorDashboardCtrl";
import IDoctorDashboardService from "../../../services/doctor/interfaces/IDoctorDashboardService";
import {inject,injectable} from "inversify";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()
export default class DoctorDashboardController implements IDoctorDashboardCtrl{

    constructor(
        @inject("IDoctorDashboardService") private _doctorDashboardService : IDoctorDashboardService
    ){}


   async getDashboardContent(req: Request, res: Response): Promise<void> {
    try {
   
      const {doctorId} = req.query;

      if (!doctorId) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'bad request , doctor id missed' });
              return;
        }

      const response = await this._doctorDashboardService.getDashboardContent(doctorId.toString());
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
  };


  async appointmentStats(req: Request, res: Response): Promise<void> {
    try {
   
      const {doctorId,filter} = req.query;

      if (!doctorId || !filter) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'bad request , doctor id missed' });
              return;
        }

      const response = await this._doctorDashboardService.appointmentStats(doctorId.toString(),filter?.toString());
      if (!response) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No stats found' });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        message: 'Appointment stats fetched successfully',
        data: response,
      });
    } catch (err) {
      console.error('Error fetching appointment stats:', err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to fetch appointment stats',
      });
    }
  };


  async reportsStats(req: Request, res: Response): Promise<void> {
    try {
   
      const {doctorId,filter} = req.query;

      if (!doctorId || !filter) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'bad request , doctor id missed' });
              return;
        }

      const response = await this._doctorDashboardService.reportsStats(doctorId.toString(),filter?.toString());
      if (!response) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No stats found' });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        message: 'Reports stats fetched successfully',
        data: response,
      });
    } catch (err) {
      console.error('Error fetching reports stats:', err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to fetch reports stats',
      });
    }
  };


  async payoutsStats(req: Request, res: Response): Promise<void> {
    try {
   
      const {doctorId} = req.query;

      if (!doctorId) {
              res.status(HttpStatusCode.BAD_REQUEST).json({ message: 'bad request , doctor id missed' });
              return;
        }

      const response = await this._doctorDashboardService.payoutsStats(doctorId.toString());
      if (!response) {
        res.status(HttpStatusCode.NOT_FOUND).json({ message: 'No stats found' });
        return;
      }

      res.status(HttpStatusCode.OK).json({
        message: 'Payouts stats fetched successfully',
        data: response,
      });
    } catch (err) {
      console.error('Error fetching payouts stats:', err);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to fetch payouts stats',
      });
    }
  };






        
}

