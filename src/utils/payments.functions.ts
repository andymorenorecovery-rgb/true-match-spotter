import { createServerFn } from "@tanstack/react-start";
import type Stripe from "stripe";
import { type StripeEnv, checkoutExtras, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";

const ID = /^[a-zA-Z0-9_-]+$/;
const ALLOWED_PRICES = new Set(["day_ad_once", "week_ad_once", "month_ad_once", "boost_once"]);

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: { priceIds: string[]; adId: string; kind: "post" | "boost"; returnUrl: string; environment: StripeEnv }) => {
    if (!Array.isArray(data.priceIds) || !data.priceIds.length || data.priceIds.length > 2) throw new Error("Invalid items");
    for (const p of data.priceIds) if (!ALLOWED_PRICES.has(p)) throw new Error("Invalid priceId");
    if (!ID.test(data.adId) || data.adId.length > 60) throw new Error("Invalid ad");
    if (data.kind !== "post" && data.kind !== "boost") throw new Error("Invalid kind");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid env");
    return data;
  })
  .handler(async ({ data }): Promise<{ clientSecret: string } | { error: string }> => {
    try {
      const stripe = createStripeClient(data.environment);
      const prices = await stripe.prices.list({ lookup_keys: data.priceIds, expand: ["data.product"] });
      if (prices.data.length !== data.priceIds.length) throw new Error("Price not found");
      const names = prices.data.map((p) => (typeof p.product === "string" ? p.product : (p.product as Stripe.Product).name));
      const session = await stripe.checkout.sessions.create({
        line_items: prices.data.map((p) => ({ price: p.id, quantity: 1 })),
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        payment_intent_data: { description: names.join(" + ") },
        metadata: { adId: data.adId, kind: data.kind, items: data.priceIds.join(","), managed_payments: "true" },
        ...checkoutExtras(data.environment),
      } as Stripe.Checkout.SessionCreateParams);
      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });

/** Confirms on the server that a checkout was actually paid. */
export const getCheckoutResult = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(data.sessionId)) throw new Error("Invalid session");
    if (data.environment !== "sandbox" && data.environment !== "live") throw new Error("Invalid env");
    return data;
  })
  .handler(async ({ data }): Promise<{ paid: boolean; adId: string; kind: string; items: string[] } | { error: string }> => {
    try {
      const stripe = createStripeClient(data.environment);
      const s = await stripe.checkout.sessions.retrieve(data.sessionId);
      return {
        paid: s.payment_status !== "unpaid" && s.status === "complete",
        adId: s.metadata?.['adId'] ?? "",
        kind: s.metadata?.['kind'] ?? "",
        items: (s.metadata?.['items'] ?? "").split(",").filter(Boolean),
      };
    } catch (error) {
      return { error: getStripeErrorMessage(error) };
    }
  });
