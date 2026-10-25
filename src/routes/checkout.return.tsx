import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStripeEnvironment } from "@/lib/stripe";
import { getCheckoutResult } from "@/utils/payments.functions";
import { boostLocalAd, claimSession, pendingAdTitle, publishPendingAd } from "@/lib/local-ads";
import { recordCheckout } from "@/utils/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { PRICING } from "@/lib/pricing";
import { BUSINESS_NAME } from "@/lib/contact";


export const Route = createFileRoute("/checkout/return")({
  validateSearch: (s: Record<string, unknown>): { session_id?: string | undefined } => ({
    session_id: typeof s['session_id'] === "string" ? s['session_id'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Payment — Ready Too Mingle" },
      { name: "description", content: "Your Ready Too Mingle payment result." },
      { property: "og:title", content: "Payment — Ready Too Mingle" },
      { property: "og:description", content: "Your Ready Too Mingle payment result." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const [state, setState] = useState<"loading" | "posted" | "boosted" | "failed">("loading");

  useEffect(() => {
    if (!session_id) return setState("failed");
    getCheckoutResult({ data: { sessionId: session_id, environment: getStripeEnvironment() } })
      .then((r) => {
        if ("error" in r || !r.paid) return setState("failed");
        const fresh = claimSession(session_id);
        const environment = getStripeEnvironment();
        const title = pendingAdTitle(r.adId);
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) recordCheckout({ data: { sessionId: session_id, environment, title } }).catch(() => {});
        });
        if (r.kind === "boost") {
          if (fresh) boostLocalAd(r.adId, PRICING.boost.durationHours);
          return setState("boosted");
        }
        if (fresh) publishPendingAd(r.adId);
        setState("posted");
      })
      .catch(() => setState("failed"));
  }, [session_id]);

  const text = {
    loading: ["Checking your payment…", ""],
    posted: ["Payment received — your ad is live!", "Thanks! Your ad is now showing in the listings."],
    boosted: ["Boosted!", `Your ad is back on top with the green glow for the next ${PRICING.boost.durationHours} hours.`],
    failed: ["Payment not completed", "We couldn't confirm a payment, so nothing was charged or posted. You can try again."],
  }[state];

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">{text[0]}</h1>
      <p className="mt-3 text-muted-foreground">{text[1]}</p>
      {state !== "loading" && (
        <p className="mt-6 text-xs text-muted-foreground">Payment processed for {BUSINESS_NAME}</p>
      )}
      {state !== "loading" && (
        <Link to="/" className="mt-8 inline-block rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground">See the listings</Link>
      )}

    </div>
  );
}
