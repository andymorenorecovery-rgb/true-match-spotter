import { describe, expect, it } from "vitest";
import { adWindowFromCheckouts } from "./ad-window";

const T = Date.parse("2026-10-01T00:00:00.000Z");
const H = 3600000;

describe("adWindowFromCheckouts", () => {
  it("$20 day ad lasts 24 hours with no boost", () => {
    const w = adWindowFromCheckouts([{ createdMs: T, kind: "post", items: ["day_ad_once"] }])!;
    expect(w.plan).toBe("day");
    expect(Date.parse(w.expiresAt) - T).toBe(24 * H);
    expect(w.boostUntil).toBeNull();
  });
  it("$99 week ad lasts 7 days with a 24-hour boost", () => {
    const w = adWindowFromCheckouts([{ createdMs: T, kind: "post", items: ["week_ad_once"] }])!;
    expect(Date.parse(w.expiresAt) - T).toBe(7 * 24 * H);
    expect(Date.parse(w.boostUntil!) - T).toBe(24 * H);
  });
  it("$299 month ad lasts 30 days", () => {
    const w = adWindowFromCheckouts([{ createdMs: T, kind: "post", items: ["month_ad_once"] }])!;
    expect(Date.parse(w.expiresAt) - T).toBe(30 * 24 * H);
  });
  it("a $10 re-boost lasts 24 hours from when it was paid", () => {
    const w = adWindowFromCheckouts([
      { createdMs: T, kind: "post", items: ["day_ad_once"] },
      { createdMs: T + 5 * H, kind: "boost", items: ["boost_once"] },
    ])!;
    expect(Date.parse(w.boostUntil!) - T).toBe(29 * H);
  });
  it("no payment and no account record means the ad cannot go live", () => {
    expect(adWindowFromCheckouts([{ createdMs: T, kind: "boost", items: ["boost_once"] }])).toBeNull();
  });
});
