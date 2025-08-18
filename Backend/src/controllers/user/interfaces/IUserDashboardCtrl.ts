import {Request,Response} from "express";


export default interface IUserDashboardCtrl {

getDashboardContent(req: Request, res: Response): Promise<void>


}