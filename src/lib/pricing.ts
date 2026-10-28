// Single source of truth for prices and durations.
export const PRICING = {
  currency: "USD",
  dayAd: { priceCents: 2000, durationHours: 24 },
  weekAd: { priceCents: 9900, durationHours: 24 * 7, includedBoostHours: 24 },
  monthAd: { priceCents: 29900, durationHours: 24 * 30, includedBoostHours: 24 },
  boost: { priceCents: 1000, durationHours: 24 },
} as const;

/** Invite rewards: each friend who pays for their first ad earns the inviter free week ad(s). */
export const REFERRAL = { freeWeeksPerFriend: 1 } as const;
/** Launch promo: the first `freeSpots` people with an account get one free 1-week ad (one per person, no boost included). Set freeSpots to 0 to end it. */
export const LAUNCH = { freeSpots: 10 } as const;
/** Giveaway: the next `spots` ads are free 1-week ads with no account and an optional video. Set spots to 0 to end it. */
export const GIVEAWAY = { spots: 0 } as const;

/** When to remind owners that their ad is about to end. */
export const REMINDERS = { endingSoonHours: 6, keepEndedDays: 30 } as const;

export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: PRICING.currency, maximumFractionDigits: 0 }).format(cents / 100);

/** Checkout price IDs for each product (same in test and live). */
export const PRICE_IDS = { dayAd: "day_ad_once", weekAd: "week_ad_once", monthAd: "month_ad_once", boost: "boost_once" } as const;
