
import {Request,Response} from "express";


export default interface IUserTransactionController {
    
getTransactions(req: Request, res: Response): Promise<void>,


}


