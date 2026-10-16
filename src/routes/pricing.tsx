import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PRICING, formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Ready Too Mingle" },
      { name: "description", content: "Post a standard ad or boost it to Featured for 7 days." },
      { property: "og:title", content: "Pricing — Ready Too Mingle" },
      { property: "og:description", content: "Post a standard ad or boost it to Featured for 7 days." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const s = PRICING.standardAd, f = PRICING.featuredBoost;
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-center text-4xl font-bold">Simple pricing</h1>
      <p className="mt-3 text-center text-muted-foreground">Pay only when you post. No subscriptions.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Plan name="Standard ad" price={formatPrice(s.priceCents)} per="per ad" items={[`Listed for ${s.durationDays} days`, "Appears in local listings", "Edit or pause anytime", "Expiry date shown in your dashboard"]} />
        <Plan highlight name="Featured boost" price={formatPrice(f.priceCents)} per={`for ${f.durationDays} days`} items={["Top placement in your area", "Gold “Featured” label", "Fair rotation with other featured ads", "Adds to an active standard ad"]} />
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Featured is paid placement. We don't promise a set number of views or replies.</p>
      <div className="mt-8 text-center"><Link to="/post" className="rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground">Post an ad</Link></div>
    </div>
  );
}

function Plan({ name, price, per, items, highlight }: { name: string; price: string; per: string; items: string[]; highlight?: boolean }) {
  return (
    <div className={`rounded-3xl border bg-card p-8 ${highlight ? "border-primary shadow-glow" : ""}`}>
      <h2 className="text-2xl font-semibold">{name}</h2>
      <p className="mt-4"><span className="text-4xl font-bold text-gradient">{price}</span> <span className="text-sm text-muted-foreground">{per}</span></p>
      <ul className="mt-6 space-y-2 text-sm">{items.map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{i}</li>)}</ul>
    </div>
  );
}
