import { createFileRoute, Link } from "@tanstack/react-router";
import { PRICING, formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post an ad — Ready Too Mingle" },
      { name: "description", content: "Create your local personal ad on Ready Too Mingle." },
      { property: "og:title", content: "Post an ad — Ready Too Mingle" },
      { property: "og:description", content: "Create your local personal ad on Ready Too Mingle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-4xl font-bold">Post an ad</h1>
      <p className="mt-4 text-muted-foreground">
        Accounts and posting are being set up next. Ads will cost {formatPrice(PRICING.standardAd.priceCents)} for {PRICING.standardAd.durationDays} days.
      </p>
      <Link to="/pricing" className="mt-8 inline-block rounded-full border px-6 py-3">See pricing</Link>
    </div>
  ),
});
