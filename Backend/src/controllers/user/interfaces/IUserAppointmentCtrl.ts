import {Request,Response} from "express";


export default interface IUserAppointmentCtrl {

fetchingDoctors(req: Request, res: Response): Promise<void>,
getAppointments (req: Request, res: Response): Promise<void> ,
cancelAppointment(req:Request, res: Response) : Promise<void>,
walletPayment(req:Request, res: Response) : Promise<void>,
activeBooking(req:Request, res: Response) : Promise<void>,

}


