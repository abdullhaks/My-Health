import {Request,Response} from "express";


export default interface IDoctorAppointmentController {

getAppointments (req: Request, res: Response): Promise<any> 

}


