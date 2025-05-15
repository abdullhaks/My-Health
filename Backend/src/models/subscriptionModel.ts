import mongoose, { Schema, Types } from "mongoose";
import { ISubscriptionDocument } from "../entities/subscriptionEntities";

const subscriptionSchema: Schema<ISubscriptionDocument> = new Schema({
  sessionId:{ type: String, required: true },
  stripeSubscriptionId: { type: String, required: true },
  stripeCustomerId: { type: String, required: true },
  stripeInvoiceId: { type: String }, 
  stripeInvoiceUrl: { type: String },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid'],
    default: 'active',
  },
  priceId: { type: String, required: true },
  interval: { type: String, enum: ['month', 'year'], required: true },
  amount: { type: Number, required: true },
  subscribedAt: { type: Date, required: true },
  doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
}, { timestamps: true });

const subscriptionModel = mongoose.model<ISubscriptionDocument>("Subscription", subscriptionSchema);

export default subscriptionModel;
