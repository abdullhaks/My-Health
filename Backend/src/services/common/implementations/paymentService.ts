import { inject, injectable } from "inversify";
import IPaymentService from "../interfaces/IPaymentService";
import IPaymentRepository from "../../../repositories/interfaces/IPaymentRepository";
import Stripe from "stripe";
import stripe from "../../../middlewares/common/stripe";
import { ISubscriptionDocument } from "../../../entities/subscriptionEntities";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";
import IAppointmentRepository from "../../../repositories/interfaces/IAppointmentRepository";
import IUserRepository from "../../../repositories/interfaces/IUserRepository";
import { IAppointmentDocument } from "../../../entities/appointmentEntities";
import IAppointmentsRepository from "../../../repositories/interfaces/IAppointmentsRepository";

@injectable()
export default class PaymentService implements IPaymentService {
  constructor(
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository,
    @inject("IAppointmentsRepository") private _appointmentsRepository:IAppointmentsRepository,
    @inject("IUserRepository") private _userRepository:IUserRepository,

  ) {}

  async handleWebhookEvent(event: any): Promise<any> {



    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      

      // console.log("event is..................", event);
      // console.log("session is..................", session);

      const metadata = session.metadata;

      if (!metadata) {
        console.error("Metadata is null or undefined.");
        throw new Error("Invalid session metadata.");
      }

      switch (metadata.role) {
        case "user":
          
        if (metadata.type === "appointment") {
          console.log("Processing one-time appointment payment for user:", metadata);

          const user = await this._userRepository.findOne({_id:metadata.userId});

          console.log("user is ",user);

            if (!user) {
              console.error("User not found:", metadata.userId);
              throw new Error("User not found.");
            };


            const doctor = await this._doctorRepository.findOne({_id:metadata.doctorId});
          console.log("doctor is ",doctor);

            if (!doctor) {
              console.error("Doctor not found:", metadata.doctorId);
              throw new Error("Doctor not found.");
            };

            const appointmentsWithSameDoc = this._appointmentsRepository.findAll({userId:metadata.userId , doctorId:metadata.doctorName});

            // if(appointmentsWithSameDoc && appointmentsWithSameDoc.length > 3){

              
            // }


            const appointmentData: Partial<IAppointmentDocument> = {
              userId: metadata.userId,
              doctorId: metadata.doctorId,
              userName: user.fullName,
              userEmail:user.email,
              doctorName: doctor.fullName,
              doctorCategory: doctor.category,
              start: new Date(metadata.start),
              end: new Date(metadata.end),
              duration: parseInt(metadata.duration),
              fee: parseInt(metadata.fee),
              slotId: metadata.slotId,
              stripeSessionId: session.id,
              paymentStatus: "completed",
              appointmentStatus: "booked",
            };



          const appointment = await this._appointmentsRepository.create(
              appointmentData
            );
            console.log("Appointment created:", appointment);
        }
        break;
        case "doctor":

        const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );


      const invoice = await stripe.invoices.retrieve(
        subscription.latest_invoice as string
      );

      console.log("subscription is ", subscription);
      console.log("invoice data is ", invoice);

          const subscriptionData: Partial<ISubscriptionDocument> = {
            sessionId: session.id,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: session.customer as string,
            stripeInvoiceId: invoice.id || undefined,
            stripeInvoiceUrl: invoice.hosted_invoice_url || undefined,
            subscriptionStatus: subscription.status as
              | "active"
              | "canceled"
              | "past_due"
              | "unpaid",
            priceId: subscription.items.data[0].price.id,
            interval:
              subscription.items.data[0].price.recurring?.interval === "year"
                ? "year"
                : "month",
            amount: subscription.items.data[0].price.unit_amount || 0,
            subscribedAt: new Date(subscription.start_date * 1000),
            doctor: session.metadata?.doctorId || undefined,
          };

          console.log("session data after webhook event ", session);
          const subResp = await this._paymentRepository.create(
            subscriptionData
          );
          console.log("subResp....is...", subResp);
          if (subscriptionData.doctor) {
            const docResp = await this._doctorRepository.update(
              subscriptionData.doctor.toString(),
              {
                premiumMembership: true,
                subscriptionId: subscriptionData.stripeSubscriptionId,
              }
            );
            console.log("docResp....is...", docResp);
          } else {
            console.error("Doctor ID is undefined.");
            throw new Error("Invalid doctor ID.");
          }

          // await this._paymentRepository.
          break;
        case "admin":
          //   await handleAdminPayment(session);
          break;
      }
    } 

    return { received: true };
  }
}
