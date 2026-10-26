// Decides when a shared ad is live and boosted, from server-confirmed payments only.
import { PRICE_IDS, PRICING } from "./pricing";

export type PaidCheckout = { createdMs: number; kind: string; items: string[] };
export type AdWindow = { plan: "day" | "week" | "month"; postedAt: string; expiresAt: string; boostUntil: string | null };

const H = 3600000;
const iso = (ms: number) => new Date(ms).toISOString();

/** `base` is the account record of a free (launch / invite) ad, used when no paid post checkout exists. */
export function adWindowFromCheckouts(list: PaidCheckout[], base?: AdWindow | null): AdWindow | null {
  const post = list.filter((c) => c.kind === "post").sort((a, b) => a.createdMs - b.createdMs)[0];
  let w: AdWindow | null = base ?? null;
  if (post) {
    const month = post.items.includes(PRICE_IDS.monthAd);
    const week = post.items.includes(PRICE_IDS.weekAd);
    const p = month ? PRICING.monthAd : week ? PRICING.weekAd : PRICING.dayAd;
    const boostH = month ? PRICING.monthAd.includedBoostHours : week ? PRICING.weekAd.includedBoostHours
      : post.items.includes(PRICE_IDS.boost) ? PRICING.boost.durationHours : 0;
    w = {
      plan: month ? "month" : week ? "week" : "day",
      postedAt: iso(post.createdMs),
      expiresAt: iso(post.createdMs + p.durationHours * H),
      boostUntil: boostH ? iso(post.createdMs + boostH * H) : null,
    };
  }
  if (!w) return null;
  for (const b of list.filter((c) => c.kind === "boost")) {
    const until = iso(b.createdMs + PRICING.boost.durationHours * H);
    if (!w.boostUntil || until > w.boostUntil) w = { ...w, boostUntil: until };
  }
  return w;
}
