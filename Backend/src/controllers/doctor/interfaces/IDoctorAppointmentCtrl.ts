import {Request,Response} from "express";


export default interface IDoctorAppointmentCtrl {

getAppointments (req: Request, res: Response): Promise<void> 
cancelAppointment (req: Request, res: Response): Promise<void> 
}


