import { Request, Response } from "express";
import IDoctorProfileCtrl from "../interfaces/IProfileCtrl";
import { inject, injectable } from "inversify";
import IDoctorProfileService from "../../../services/doctor/interfaces/IDoctorAuthServices";
import stripe, { makePayment } from "../../../middlewares/common/stripe"




@injectable()
export default class DoctorProfileController implements IDoctorProfileCtrl {
  private _doctorService: IDoctorProfileService;

  constructor(@inject("IDoctorAuthService") DoctorAuthService: IDoctorProfileService) {
    this._doctorService = DoctorAuthService;
  }


      async createCheckoutSession(req: Request, res: Response): Promise<any> {
        const { priceId, metadata } = req.body;
      
        // Determine redirect paths based on role
        const successPath = `/${metadata.role}/payment-success`;
        const cancelPath = `/${metadata.role}/payment-cancelled`;
      
        // const session = await stripe.checkout.sessions.create({
      //   payment_method_types: ["card"],
      //   line_items: [
      //     {
      //       price: priceId, // from Stripe Dashboard
      //       quantity: 1,
      //     },
      //   ],
      //   mode: "subscription", // or 'payment' for one-time
      //   success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      //   cancel_url: `${process.env.CLIENT_URL}/payment-cancelled`,
      //   metadata, // pass any related data
      // });

        try {
          const session = await makePayment({
            priceId,
            mode: "subscription",
            metadata,
            successPath,
            cancelPath,
          });
      
          console.log("Session details:", session);
          console.log("i am here");
          return res.status(200).json({ url: session.url });
        } catch (err) {
          console.error("Stripe error:", err);
          return res.status(500).json({ message: "Payment session creation failed" });
        }
      }

}