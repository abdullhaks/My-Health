import { Document,Types } from "mongoose";


export interface ISubscriptionDocument extends Document {
    stripeSubscriptionId: string;
    stripeCustomerId: string;
    stripeInvoiceId?: string;
    stripeInvoiceUrl?: string;
    status: 'active' | 'canceled' | 'past_due' | 'unpaid';
    priceId: string;
    interval: 'month' | 'year';
    amount: number;
    subscribedAt: Date;
    currentPeriodEnd: number;
    doctor: Types.ObjectId;
  }