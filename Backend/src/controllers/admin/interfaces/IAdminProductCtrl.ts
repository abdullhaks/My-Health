import { Request, Response } from "express";

export default interface IAdminProductCtrl {
  getProducts(req: Request, res: Response): Promise<void>;
  createProduct(req: Request, res: Response): Promise<void>;
  updateProduct(req: Request, res: Response): Promise<void>;
  deleteProduct(req: Request, res: Response): Promise<void>;
}