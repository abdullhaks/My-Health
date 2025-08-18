import {Request,Response} from "express";


export default interface IDoctorDashboardCtrl {

getDashboardContent(req: Request, res: Response): Promise<void>


}