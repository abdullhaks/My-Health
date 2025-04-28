import { Request, Response } from 'express';

export default interface IUserProfileCtrl {

    updateProfile(req: Request, res: Response): Promise<void>;
    updateDp(req:Request,res:Response):Promise<void>
    changePassword(req:Request,res:Response):Promise<any>
}



