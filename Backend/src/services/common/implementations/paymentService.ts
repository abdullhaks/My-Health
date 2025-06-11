import { inject, injectable } from "inversify";
import IPaymentService from "../interfaces/IPaymentService";
import IPaymentRepository from "../../../repositories/interfaces/IPaymentRepository";
import Stripe from "stripe";
import stripe from "../../../middlewares/common/stripe";
import { ISubscriptionDocument } from "../../../entities/subscriptionEntities";
import IDoctorRepository from "../../../repositories/interfaces/IDoctorRepository";

@injectable()
export default class PaymentService implements IPaymentService {
  constructor(
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("IDoctorRepository") private _doctorRepository: IDoctorRepository
  ) {}

  async handleWebhookEvent(event: any): Promise<any> {



    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      

      console.log("event is..................", event);
      console.log("session is..................", session);

      const metadata = session.metadata;

      if (!metadata) {
        console.error("Metadata is null or undefined.");
        throw new Error("Invalid session metadata.");
      }

      switch (metadata.role) {
        case "user":
          console.log("User payment session completed:", session);
        if (metadata.type === "appointment") {
          // Handle one-time appointment payment
          // Example: Update appointment status in the database
          console.log("Processing one-time appointment payment for user:", metadata);
          // Call a service to update the appointment status
          // await this._paymentService.handleUserAppointmentPayment(session);
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
