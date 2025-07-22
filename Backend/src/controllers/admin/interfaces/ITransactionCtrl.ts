
import {Request,Response} from "express";


export default interface IAdminTransactionController {
    
getTransactions(req: Request, res: Response): Promise<void>,


}


