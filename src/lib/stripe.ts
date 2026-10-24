import { loadStripe, type Stripe } from "@stripe/stripe-js";

type StripeEnv = "sandbox" | "live";

/** Browser publishable key. A self-hosted build may use either name. */
export function paymentsClientToken(): string | undefined {
  return (import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'] ?? import.meta.env['VITE_STRIPE_PUBLISHABLE_KEY']) as
    | string
    | undefined;
}

const clientToken = paymentsClientToken();

function paymentsEnvironment(): StripeEnv {
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(
    "Payments are not configured for this build. Finish the payment setup to enable checkout.",
  );
}

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    paymentsEnvironment();
    stripePromise = loadStripe(clientToken as string);
  }
  return stripePromise;
}

export function getStripeEnvironment(): StripeEnv {
  return paymentsEnvironment();
}
