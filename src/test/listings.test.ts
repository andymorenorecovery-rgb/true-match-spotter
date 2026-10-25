import { describe, expect, it } from "vitest";
import { CATEGORIES, SAMPLE_LISTINGS, glowOf, rankListings, type Listing } from "@/lib/listings";
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
  it("re-boosting to the top costs $10 for 24 hours", () => {
    expect(PRICING.boost.priceCents).toBe(1000);
    expect(PRICING.boost.durationHours).toBe(24);
  });
  it("a week ad includes a 24-hour boost", () => expect(PRICING.weekAd.includedBoostHours).toBe(24));
});

describe("categories", () => {
  it("allows hookups, dating and eye candy, in that order", () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual(["hookups", "dating", "eye-candy"]);
  });
});

describe("rankListings", () => {
  it("hides expired and non-published ads", () => {
    const r = rankListings([base("a", { expiresAt: d(-1) }), base("b", { status: "draft" }), base("c")], now);
    expect(r.map((l) => l.id)).toEqual(["c"]);
  });
  it("puts active boosted ads first and drops expired boosts back to regular", () => {
    const r = rankListings([base("a", { postedAt: d(0) }), base("b", { featuredUntil: d(1) }), base("c", { featuredUntil: d(-1), postedAt: d(-5) })], now);
    expect(r.map((l) => l.id)).toEqual(["b", "a", "c"]);
  });
  it("keeps boosted ads on top even when a newer unboosted ad exists", () => {
    const r = rankListings([base("new", { postedAt: d(0) }), base("boost", { featuredUntil: d(1), postedAt: d(-3) })], now);
    expect(r.map((l) => l.id)).toEqual(["boost", "new"]);
  });
  it("the most recent boost goes first, pushing earlier boosts down", () => {
    const r = rankListings([base("a"), base("early", { featuredUntil: d(0.5) }), base("late", { featuredUntil: d(0.9) })], now);
    expect(r.map((l) => l.id)).toEqual(["late", "early", "a"]);
  });
  it("24-hour ads get purple, boosted ads get green", () => {
    expect(glowOf(base("x", { plan: "day" }), now)).toBe("day");
    expect(glowOf(base("y", { plan: "day", featuredUntil: d(1) }), now)).toBe("boost");
    expect(glowOf(base("z", { plan: "week" }), now)).toBe(null);
  });
});

describe("sample ads", () => {
  it("stay on the front page whatever the clock says", () => {
    const ids = (now: number) => rankListings(SAMPLE_LISTINGS, now).map((l) => l.id);
    const today = ids(Date.parse("2026-10-24T00:00:00Z"));
    const later = ids(Date.parse("2028-05-01T00:00:00Z"));
    expect(today.length).toBe(3);
    expect(today[0]).toBe("1");
    expect(today).not.toContain("5");
    expect(later).toEqual(today);
  });
});

describe("Women filter", () => {
  it("never reuses a man's photo on a woman's profile", async () => {
    const { SAMPLE_LISTINGS } = await import("@/lib/listings");
    const menPhotos = new Set(SAMPLE_LISTINGS.filter((l) => l.details?.gender === "Man").flatMap((l) => [l.img, ...(l.photos ?? [])]));
    for (const w of SAMPLE_LISTINGS.filter((l) => l.details?.gender === "Woman")) {
      for (const p of [w.img, ...(w.photos ?? [])]) expect(menPhotos.has(p)).toBe(false);
    }
  });
});
