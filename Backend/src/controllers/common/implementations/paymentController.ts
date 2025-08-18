
import { Request, Response } from "express";
import Stripe from "stripe";
import stripe from "../../../middlewares/common/stripe";
import IPaymentCtrl from "../interfaces/IPaymentCtrl";
import { inject,injectable } from "inversify";
import IPaymentService from "../../../services/common/interfaces/IPaymentService";
import { makeOneTimePayment } from "../../../middlewares/common/stripe";
import { HttpStatusCode } from "../../../utils/enum";


@injectable()
export default class PaymentController implements IPaymentCtrl {


  constructor(@inject("IPaymentService") private _paymentService: IPaymentService)
  { }


  async stripeWebhookController (req:Request , res:Response):Promise<void>{

    const sig = req.headers["stripe-signature"] as string;
    let event: Stripe.Event;

    try{
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );


      const response =await this._paymentService.handleWebhookEvent(event)

      if (response)   res.status(HttpStatusCode.OK).json({ received: true })
      else  res.status(HttpStatusCode.BAD_REQUEST).json({ msg: "Webhook signature verification failed..." });

    }catch(error){
      console.error("Webhook signature verification failed.", error);
       res.status(HttpStatusCode.BAD_REQUEST).send(`Webhook Error: ${(error as Error).message}`);
    }
  };

  


  async createOneTimePaymentSession(req: Request, res: Response): Promise<void> {
    const { amount, metadata } = req.body;
    console.log("Creating one-time payment session with amount:", amount, "and metadata:", metadata);
    
    const successPath = `/${metadata.role}/payment-success`;
    const cancelPath = `/${metadata.role}/payment-cancelled`;

    try {
      const session = await makeOneTimePayment({
        amount,
        currency: "inr",
        metadata, 
        successPath,
        cancelPath,
      });

      console.log("One-time payment session:", session);
       res.status(HttpStatusCode.OK).json({ url: session.url });
    } catch (err) {
      console.error("Stripe one-time payment error:", err);
       res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "One-time payment session creation failed" });
    }
  }



}










// export const stripeWebhookController = async (req: Request, res: Response):Promise<void> => {
//     const sig = req.headers["stripe-signature"] as string;
  
//     var event: Stripe.Event;
  
//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//     } catch (err) {
//       console.error("Webhook signature verification failed.", err);
//        res.status(HttpStatusCode.BAD_REQUEST).send(`Webhook Error: ${(err as Error).message}`);
//     }
  
//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object as Stripe.Checkout.Session;
//       const metadata = session.metadata;

//       if (!metadata) {
//         console.error("Metadata is null or undefined.");
//          res.status(HttpStatusCode.BAD_REQUEST).send("Invalid session metadata.");
//       }

//       switch (metadata.role) {
//         case "user":
//             console.log("session data after webhook event ",session);
            
//         //   await handleUserPayment(session);
//           break;
//         case "doctor":
//             console.log("session data after webhook event ",session);
//         //   await handleDoctorPayment(session);
//           break;
//         case "admin":
//             console.log("session data after webhook event ",session);
//         //   await handleAdminPayment(session);
//           break;
//       }
//     }
  
//     res.status(HttpStatusCode.OK).json({ received: true });
//   };
  