import { describe, expect, it } from "vitest";
import { rankListings, type Listing } from "@/lib/listings";
import { PRICING } from "@/lib/pricing";

const now = Date.parse("2026-10-16T00:00:00Z");
const d = (days: number) => new Date(now + days * 86400000).toISOString();
const base = (id: string, extra: Partial<Listing> = {}): Listing => ({
  id, title: id, name: id, age: 30, city: "LA", area: "x", category: "dating", body: "", img: "", state: "CA", details: {},
  status: "published", postedAt: d(-1), expiresAt: d(10), ...extra,
});

describe("pricing", () => {
  it("posting for 24 hours costs $20", () => {
    expect(PRICING.dayAd.priceCents).toBe(2000);
    expect(PRICING.dayAd.durationHours).toBe(24);
  });
  it("posting for a week costs $120", () => {
    expect(PRICING.weekAd.priceCents).toBe(12000);
    expect(PRICING.weekAd.durationHours).toBe(168);
  });
  it("boosting to the top costs $20", () => expect(PRICING.boost.priceCents).toBe(2000));
});

describe("rankListings", () => {
  it("hides expired and non-published ads", () => {
    const r = rankListings([base("a", { expiresAt: d(-1) }), base("b", { status: "draft" }), base("c")], now);
    expect(r.map((l) => l.id)).toEqual(["c"]);
  });
  it("puts active featured ads first and drops expired boosts back to regular", () => {
    const r = rankListings([base("a", { postedAt: d(0) }), base("b", { featuredUntil: d(1) }), base("c", { featuredUntil: d(-1), postedAt: d(-5) })], now, 0);
    expect(r.map((l) => l.id)).toEqual(["b", "a", "c"]);
  });
  it("rotates which featured ad is on top", () => {
    const list = [base("a", { featuredUntil: d(1) }), base("b", { featuredUntil: d(1) })];
    expect(rankListings(list, now, 0)[0]?.id).toBe("a");
    expect(rankListings(list, now, 1)[0]?.id).toBe("b");
  });
});
