import { describe, expect, it } from "vitest";
import { checkoutExtras, directSecretKey, isDirectStripe } from "@/lib/stripe.server";

describe("payments outside Lovable", () => {
  it("uses the owner's own Stripe key when the host provides one", () => {
    expect(directSecretKey("live", { STRIPE_SECRET_KEY: "sk_live_x" })).toBe("sk_live_x");
    expect(directSecretKey("sandbox", { STRIPE_SANDBOX_SECRET_KEY: "sk_test_y" })).toBe("sk_test_y");
    expect(directSecretKey("live", {})).toBeUndefined();
    expect(isDirectStripe("live", { STRIPE_SECRET_KEY: "sk_live_x" })).toBe(true);
    expect(isDirectStripe("live", {})).toBe(false);
  });
  it("only asks the Lovable gateway for managed payments when no own key is set", () => {
    expect(checkoutExtras("live", { STRIPE_SECRET_KEY: "sk_live_x" })).toEqual({});
    expect(checkoutExtras("live", {})).toEqual({ managed_payments: { enabled: true } });
  });
});
