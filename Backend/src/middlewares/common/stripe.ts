import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-04-30.basil',
});

export default stripe;




export const makePayment = async ({
  priceId,
  mode = "subscription",
  metadata = {},
  successPath = "/payment-success",
  cancelPath = "/payment-cancelled",
}: {
  priceId: string;
  mode?: "subscription" | "payment";
  metadata?: Record<string, any>;
  successPath?: string;
  cancelPath?: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode,
    success_url: `${process.env.CLIENT_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}${cancelPath}`,
    metadata,
  });

  return session;
};




  