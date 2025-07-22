import { Request,Response } from "express";

export default interface IPaymentCtrl{

    stripeWebhookController (req: Request, res: Response):Promise<void>
    createOneTimePaymentSession(req: Request, res: Response): Promise<void>

}