import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PRICING, formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Ready Too Mingle" },
      { name: "description", content: "Post an ad for 24 hours or a full week, and boost it to the top." },
      { property: "og:title", content: "Pricing — Ready Too Mingle" },
      { property: "og:description", content: "Post an ad for 24 hours or a full week, and boost it to the top." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const d = PRICING.dayAd, w = PRICING.weekAd, b = PRICING.boost;
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="text-center text-4xl font-bold">Simple pricing</h1>
      <p className="mt-3 text-center text-muted-foreground">Pay only when you post. No subscriptions.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Plan name="24-hour ad" price={formatPrice(d.priceCents)} per={`for ${d.durationHours} hours`} items={["Appears in local listings", "All your details and photos", "Optional phone number"]} />
        <Plan name="Week ad" price={formatPrice(w.priceCents)} per="for 7 days" items={["Listed for a full week", "All your details and photos", "Optional phone number"]} />
        <Plan boost name="Boost to top" price={formatPrice(b.priceCents)} per={`for ${b.durationHours} hours`} items={["Moves your ad to the top", "Light-green glow around your ad", "Fair rotation with other boosted ads", "Add to any active ad"]} />
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">Boosts are paid placement. We don't promise a set number of views or replies.</p>
      <div className="mt-8 text-center"><Link to="/post" className="rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground">Post an ad</Link></div>
    </div>
  );
}

function Plan({ name, price, per, items, boost }: { name: string; price: string; per: string; items: string[]; boost?: boolean }) {
  return (
    <div className={`rounded-3xl border bg-card p-8 ${boost ? "border-boost shadow-boost" : ""}`}>
      <h2 className="text-2xl font-semibold">{name}</h2>
      <p className="mt-4"><span className="text-4xl font-bold text-gradient">{price}</span> <span className="text-sm text-muted-foreground">{per}</span></p>
      <ul className="mt-6 space-y-2 text-sm">{items.map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 text-primary" />{i}</li>)}</ul>
    </div>
  );
}
