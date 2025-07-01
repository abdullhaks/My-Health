import { Document,Types } from "mongoose";


export interface ISubscriptionDocument extends Document {
    sessionId:string;
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripeInvoiceId?: string;
    stripeInvoiceUrl?: string;
    subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid';
    priceId: string;
    interval: 'month' | 'year';
    amount: number;
    subscribedAt: Date;
    doctor: Types.ObjectId | string |undefined
    userId: Types.ObjectId | string |undefined

  }