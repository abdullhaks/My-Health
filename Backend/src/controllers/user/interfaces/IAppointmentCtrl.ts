import {Request,Response} from "express";


export default interface IUserAppointmentController {

fetchingDoctors(req: Request, res: Response): Promise<any>,
getAppointments (req: Request, res: Response): Promise<any> 

}


