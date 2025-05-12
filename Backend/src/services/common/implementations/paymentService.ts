import {inject,injectable} from "inversify"
import IPaymentService from "../interfaces/IPaymentService"
import IPaymentRepository from "../../../repositories/interfaces/IPaymentRepository"
import Stripe from "stripe";
import stripe from "../../../middlewares/common/stripe";
import { ISubscriptionDocument } from "../../../entities/subscriptionEntities";

@injectable()
export default class PaymentService implements IPaymentService {

    constructor(@inject("IPaymentRepository") private _paymentRepository:IPaymentRepository){

    }


    async handleWebhookEvent(event:any):Promise<any>{

        if (event.type === "checkout.session.completed") {
              const session = event.data.object as Stripe.Checkout.Session;
              const subscription = await stripe.subscriptions.retrieve(session.subscription as string);


              console.log("event is..................",event)
              console.log("session is..................",session)

              const metadata = session.metadata;
        
              if (!metadata) {
                console.error("Metadata is null or undefined.");
                throw new Error("Invalid session metadata.");
              }

  
  const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
  
  console.log("subscription is ",subscription);
  console.log("invoice data is ",invoice);
              
  const subscriptionData: Partial<ISubscriptionDocument> = {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: session.customer as string,
    stripeInvoiceId: invoice.id || undefined,
    stripeInvoiceUrl: invoice.hosted_invoice_url || undefined,
    subscriptionStatus: subscription.status as 'active' | 'canceled' | 'past_due' | 'unpaid',
    priceId: subscription.items.data[0].price.id,
    interval: subscription.items.data[0].price.recurring?.interval === 'year' ? 'year' : 'month',
    amount: subscription.items.data[0].price.unit_amount || 0,
    subscribedAt: new Date(subscription.start_date * 1000),
    doctor: session.metadata?.doctorId || undefined,

  };


              switch (metadata.role) {
                case "user":
                    
                //   await handleUserPayment(session);
                  break;
                case "doctor":

                    console.log("session data after webhook event ",session);
                    const subResp = await this._paymentRepository.create(subscriptionData);
                    console.log("subResp....is...",subResp);
                 
                // await this._paymentRepository.
                  break;
                case "admin":
                //   await handleAdminPayment(session);
                  break;
              }
            }
          
            return{ received: true };
    };


   

}