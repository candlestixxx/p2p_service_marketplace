import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_12345", {
  apiVersion: "2026-04-22.dahlia",
  appInfo: {
    name: "ServiceHub",
    version: "0.1.0",
  },
});
