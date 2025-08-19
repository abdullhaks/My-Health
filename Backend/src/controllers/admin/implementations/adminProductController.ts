import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import IAdminProductCtrl from "../interfaces/IAdminProductCtrl";
import stripe from "../../../middlewares/common/stripe";
import { HttpStatusCode } from "../../../utils/enum";

@injectable()
export default class AdminProductController implements IAdminProductCtrl {

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

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, currency, interval } = req.body;

      // Create product
      const product = await stripe.products.create({
        name,
        description,
      });

      // Create price for the product
      const priceObj = await stripe.prices.create({
        product: product.id,
        unit_amount: price,
        currency,
        recurring: interval !== 'one_time' ? { interval } : undefined,
      });

      // Set the default price for the product
      await stripe.products.update(product.id, {
        default_price: priceObj.id,
      });

      // Fetch the updated product with expanded default_price
      const updatedProduct = await stripe.products.retrieve(product.id, {
        expand: ['default_price'],
      });

      res.status(HttpStatusCode.CREATED).json({ data: updatedProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to create product" });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      
      const { name, description, price, currency, interval ,id } = req.body;

      // Update product
      const product = await stripe.products.update(id, {
        name,
        description,
      });

      // Create new price (Stripe doesn't allow updating existing prices)
      const priceObj = await stripe.prices.create({
        product: id,
        unit_amount: price,
        currency,
        recurring: interval !== 'one_time' ? { interval } : undefined,
      });

      // Update product's default price
      await stripe.products.update(id, {
        default_price: priceObj.id,
      });

      // Fetch the updated product with expanded default_price
      const updatedProduct = await stripe.products.retrieve(id, {
        expand: ['default_price'],
      });

      res.status(HttpStatusCode.OK).json({ data: updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to update product" });
    }
  }

  async deActivateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      console.log("id is .......:",id);
      await stripe.products.update(id,{ active: false });

      res.status(HttpStatusCode.OK).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete product" });
    }
  };

  

   async activateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      console.log("id is .......:",id);
      await stripe.products.update(id,{ active: true });

      res.status(HttpStatusCode.OK).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete product" });
    }
  };
}