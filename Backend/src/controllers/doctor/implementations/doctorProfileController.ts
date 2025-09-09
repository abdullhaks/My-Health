import { Request, Response } from "express";
import IDoctorProfileCtrl from "../interfaces/IDoctorProfileCtrl";
import { inject, injectable } from "inversify";
import IDoctorProfileService from "../../../services/doctor/interfaces/IDoctorProfileSevices";
import stripe, { makePayment } from "../../../middlewares/common/stripe"
import { HttpStatusCode } from "../../../utils/enum"
import { doctorProfileUpdate } from "../../../dto/doctorDTO";



@injectable()
export default class DoctorProfileController implements IDoctorProfileCtrl {


  constructor(@inject("IDoctorProfileService")   private _doctorProfileService: IDoctorProfileService
) {  }


      async createCheckoutSession(req: Request, res: Response): Promise<void> {
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
      //   metadata, // pass void related data
      // });

        try {
          const session = await makePayment({
            priceId,
            mode: "subscription",
            metadata,
            successPath,
            cancelPath,
          });

          if(!session){
             res.status(HttpStatusCode.BAD_REQUEST).json({meg:"make payment failed"})
             return;
          }
      
          console.log("Session details:", session);
          console.log("i am here");
           res.status(HttpStatusCode.OK).json({ url: session.url });
        } catch (err) {
          console.error("Stripe error:", err);
           res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Payment session creation failed" });
        }
      };


      async verifyingSubscription(req: Request, res: Response): Promise<void>{

        const {sessionId,doctorId} = req.body;
        console.log("sessoin id is ...",sessionId);

        try{

          const response = await this._doctorProfileService.verifySubscription(sessionId,doctorId)

           res.status(HttpStatusCode.OK).json(response);

        }catch(error){
          console.error("Stripe error:", error);
           res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Subscription verification failed" });
        }

      };



      async updateDp (req:Request,res:Response):Promise<void> {

        try{
            const { id } = req.params;
            const updatedFields = req.body;
            const uploadedImageKey = req.body.uploadedImageKey

            console.log("Doctor ID IS ",req.params,id);
            console.log("updatedField is ",updatedFields);
            console.log("uploadedImageKey is ",uploadedImageKey);

            const updatedDoctor = await this._doctorProfileService.updateDoctorDp(id, updatedFields, uploadedImageKey);

            res.status(HttpStatusCode.OK).json({updatedDoctor});

    
        }catch(error){
            console.log(error);
            res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ msg: "internal server error" });
        }
    

    };


      async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userData: doctorProfileUpdate = req.body;
      const userId = req.params.id;

      if (userData.dob) {
        const dob = new Date(userData.dob);
        if (isNaN(dob.getTime())) {
          res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Invalid date of birth" });
          return;
        }
        const year = dob.getFullYear();
        const month = String(dob.getMonth() + 1).padStart(2, "0");
        const day = String(dob.getDate()).padStart(2, "0");
        userData.dob = `${year}-${month}-${day}`;
      }

      const result = await this._doctorProfileService.updateProfile(userId, userData);
      res.status(HttpStatusCode.OK).json(result);
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
  }

}