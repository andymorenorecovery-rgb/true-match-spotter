// Single source of truth for prices and durations.
export const PRICING = {
  currency: "USD",
  dayAd: { priceCents: 2000, durationHours: 24 },
  weekAd: { priceCents: 12000, durationHours: 24 * 7 },
  boost: { priceCents: 2000, durationHours: 24 },
} as const;

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: PRICING.currency, maximumFractionDigits: 0 }).format(cents / 100);
