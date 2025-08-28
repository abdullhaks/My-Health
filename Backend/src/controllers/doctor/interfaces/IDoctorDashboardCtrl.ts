import {Request,Response} from "express";


export default interface IDoctorDashboardCtrl {

getDashboardContent(req: Request, res: Response): Promise<void>
appointmentStats(req: Request, res: Response): Promise<void>
reportsStats(req: Request, res: Response): Promise<void>
payoutsStats(req: Request, res: Response): Promise<void>

}