import {Request,Response} from "express";


export default interface IUserDashboardController {

getDashboardContent(req: Request, res: Response): Promise<void>


}