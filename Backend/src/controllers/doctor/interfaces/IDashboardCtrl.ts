import {Request,Response} from "express";


export default interface IDoctorDashboardController {

getDashboardContent(req: Request, res: Response): Promise<void>


}