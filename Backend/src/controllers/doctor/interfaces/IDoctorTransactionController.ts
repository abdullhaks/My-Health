
import {Request,Response} from "express";


export default interface IDoctorTransactionController {
    
getRevenues(req: Request, res: Response): Promise<void>,


}


