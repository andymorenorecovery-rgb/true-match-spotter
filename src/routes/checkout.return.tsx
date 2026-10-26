import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStripeEnvironment } from "@/lib/stripe";
import { getCheckoutResult } from "@/utils/payments.functions";
import { boostLocalAd, claimSession, pendingAdTitle, publishPendingAd } from "@/lib/local-ads";
import { saveDraftMedia } from "@/lib/ad-videos";
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
  const [state, setState] = useState<{ kind: "loading" | "failed" } | { kind: "posted" | "boosted"; adId: string }>({ kind: "loading" });

  useEffect(() => {
    if (!session_id) return setState({ kind: "failed" });
    getCheckoutResult({ data: { sessionId: session_id, environment: getStripeEnvironment() } })
      .then((r) => {
        if ("error" in r || !r.paid) return setState({ kind: "failed" });
        const fresh = claimSession(session_id);
        const environment = getStripeEnvironment();
        const title = pendingAdTitle(r.adId);
        supabase.auth.getSession().then(({ data }) => {
          if (data.session) recordCheckout({ data: { sessionId: session_id, environment, title } }).catch(() => {});
        });
        if (r.kind === "boost") {
          if (fresh) boostLocalAd(r.adId, PRICING.boost.durationHours);
          return setState({ kind: "boosted", adId: r.adId });
        }
        if (fresh) { publishPendingAd(r.adId); try { localStorage.removeItem("rtm-post-draft"); } catch { /* */ } saveDraftMedia([], null); }
        setState({ kind: "posted", adId: r.adId });
      })
      .catch(() => setState({ kind: "failed" }));
  }, [session_id]);

  const text = {
    loading: ["Checking your payment…", ""],
    posted: ["Payment received — your ad is live!", "Thanks! Your ad is now showing in the listings."],
    boosted: ["Boosted!", `Your ad is back on top with the green glow for the next ${PRICING.boost.durationHours} hours.`],
    failed: ["Payment not completed", "We couldn't confirm a payment, so nothing was charged or posted. You can try again."],
  }[state.kind];

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">{text[0]}</h1>
      <p className="mt-3 text-muted-foreground">{text[1]}</p>
      {state !== "loading" && (
        <p className="mt-6 text-xs text-muted-foreground">Payment processed for {BUSINESS_NAME}</p>
      )}
      {state.kind === "failed" && (
        <Link to="/" className="mt-8 inline-block rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground">See the listings</Link>
      )}
      {(state.kind === "posted" || state.kind === "boosted") && (
        <>
          <Link to="/listings/$id" params={{ id: state.adId }} className="mt-8 inline-block rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow">
            {state.kind === "posted" ? "See my ad" : "Back to my ad"}
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Your ad is saved on this phone or browser. Come back here any time to edit or boost it.
          </p>
        </>
      )}
    </div>
  );
}
