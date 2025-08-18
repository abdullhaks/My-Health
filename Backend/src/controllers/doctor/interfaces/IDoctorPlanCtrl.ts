import { Request, Response } from "express";

export default interface IDoctorPlanCtrl {
  getProducts(req: Request, res: Response): Promise<void>;
  
}