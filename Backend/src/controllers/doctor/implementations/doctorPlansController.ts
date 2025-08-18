import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import IDoctorPlanCtrl from "../interfaces/IDoctorPlanCtrl";
import stripe from "../../../middlewares/common/stripe";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class DoctorPlansController implements IDoctorPlanCtrl {
  async getProducts(req:Request, res: Response): Promise<void> {
    try {
      const products = await stripe.products.list({
        expand: ['data.default_price'], // Expand the default_price field to include full price details
      });
      console.log("products from stripe is ", products);
      res.status(HttpStatusCode.OK).json({ data: products.data });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch products" });
    }
  }

}