// Single source of truth for prices and durations.
export const PRICING = {
  currency: "USD",
  standardAd: { priceCents: 2000, durationDays: 30 },
  featuredBoost: { priceCents: 12000, durationDays: 7 },
} as const;

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: PRICING.currency, maximumFractionDigits: 0 }).format(cents / 100);
