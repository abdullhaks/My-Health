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





export const makeOneTimePayment = async ({
  amount,
  currency = "inr",
  metadata = {},
  successPath = "/payment-success",
  cancelPath = "/payment-cancelled",
}: {
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
  successPath?: string;
  cancelPath?: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: metadata.type === "report_analysis" ? "Report Analysis" : "Doctor Appointment",
            description:
              metadata.type === "report_analysis"
                ? `Health report analysis fee`
                : `Appointment fee for doctor consultation`,
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    invoice_creation: {
    enabled: true,
    },
    success_url: `${process.env.CLIENT_URL}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}${cancelPath}`,
    metadata,
  });

  return session;
};




  