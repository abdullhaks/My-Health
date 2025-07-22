import {Request,Response} from "express";



export default interface IAdminAppointmentController {
    
getAppointments (req: Request, res: Response): Promise<void> ,

}


