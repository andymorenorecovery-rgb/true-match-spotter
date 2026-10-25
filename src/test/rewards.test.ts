import { describe, expect, it } from "vitest";
import { earnsReferralReward, remindersFor, type AdRecord } from "@/lib/rewards";
import { REFERRAL } from "@/lib/pricing";

const now = Date.parse("2026-10-25T12:00:00Z");
const h = (n: number) => new Date(now + n * 3600000).toISOString();
const ad = (x: Partial<AdRecord>): AdRecord => ({ ad_id: "a1", title: "Hi", plan: "day", expires_at: h(20), boost_until: null, ...x });

describe("invite rewards", () => {
  it("bringing 1 friend earns 1 free week ad", () => expect(REFERRAL.freeWeeksPerFriend).toBe(1));
  it("rewards when the invited friend pays for an ad", () =>
    expect(earnsReferralReward({ referredBy: "u1", alreadyRewarded: false, kind: "post", paid: true })).toBe(true));
  it("does not reward when the friend only signs up or boosts", () =>
    expect(earnsReferralReward({ referredBy: "u1", alreadyRewarded: false, kind: "boost", paid: true })).toBe(false));
  it("does not reward unpaid checkouts", () =>
    expect(earnsReferralReward({ referredBy: "u1", alreadyRewarded: false, kind: "post", paid: false })).toBe(false));
  it("rewards only once per friend", () =>
    expect(earnsReferralReward({ referredBy: "u1", alreadyRewarded: true, kind: "post", paid: true })).toBe(false));
});

describe("reminders", () => {
  const kinds = (a: AdRecord) => remindersFor([a], now).map((r) => r.kind);
  it("reminds to boost again when the boost ran out", () => expect(kinds(ad({ boost_until: h(-1) }))).toEqual(["boost_ended"]));
  it("no reminder while still boosted", () => expect(kinds(ad({ boost_until: h(2) }))).toEqual([]));
  it("reminds to repost when the ad ends within 6 hours", () => expect(kinds(ad({ expires_at: h(5) }))).toEqual(["ad_ending"]));
  it("reminds to repost after the ad ended", () => expect(kinds(ad({ expires_at: h(-2), boost_until: h(-3) }))).toEqual(["ad_ended"]));
});
