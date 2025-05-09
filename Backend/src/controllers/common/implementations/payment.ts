
import { NextFunction, Request, Response } from "express";
import Stripe from "stripe";
import stripe from "../../../middlewares/common/stripe";

export const stripeWebhookController = async (req: Request, res: Response):Promise<any> => {
    const sig = req.headers["stripe-signature"] as string;
  
    let event: Stripe.Event;
  
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }
  
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (!metadata) {
        console.error("Metadata is null or undefined.");
        return res.status(400).send("Invalid session metadata.");
      }

      switch (metadata.role) {
        case "user":
            console.log("session data after webhook event ",session);
            
        //   await handleUserPayment(session);
          break;
        case "doctor":
            console.log("session data after webhook event ",session);
        //   await handleDoctorPayment(session);
          break;
        case "admin":
            console.log("session data after webhook event ",session);
        //   await handleAdminPayment(session);
          break;
      }
    }
  
    res.status(200).json({ received: true });
  };
  