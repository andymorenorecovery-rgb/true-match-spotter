// Pure rules for invite rewards and owner reminders (tested in src/test/rewards.test.ts).
import { PRICING, REFERRAL, REMINDERS, formatPrice } from "@/lib/pricing";

export type AdRecord = { ad_id: string; title: string; plan: "day" | "week" | string; expires_at: string; boost_until: string | null };
export type Reminder = { dedupe_key: string; kind: "boost_ended" | "ad_ending" | "ad_ended"; ad_id: string; message: string };

const name = (a: AdRecord) => (a.title ? `"${a.title}"` : "your ad");

/** Reminders an owner should see right now for their ads. */
export function remindersFor(ads: AdRecord[], now = Date.now()): Reminder[] {
  const out: Reminder[] = [];
  for (const a of ads) {
    const end = Date.parse(a.expires_at);
    const boost = a.boost_until ? Date.parse(a.boost_until) : null;
    if (end <= now) {
      if (now - end > REMINDERS.keepEndedDays * 86400000) continue;
      out.push({ dedupe_key: `ended:${a.ad_id}:${a.expires_at}`, kind: "ad_ended", ad_id: a.ad_id,
        message: `${name(a)} has ended. Repost it to show up again.` });
      continue;
    }
    if (end - now <= REMINDERS.endingSoonHours * 3600000) {
      out.push({ dedupe_key: `ending:${a.ad_id}:${a.expires_at}`, kind: "ad_ending", ad_id: a.ad_id,
        message: `${name(a)} ends in less than ${REMINDERS.endingSoonHours} hours. Repost it to stay up.` });
    }
    if (boost !== null && boost <= now) {
      out.push({ dedupe_key: `boost:${a.ad_id}:${a.boost_until}`, kind: "boost_ended", ad_id: a.ad_id,
        message: `Your boost on ${name(a)} ended. Boost again for ${formatPrice(PRICING.boost.priceCents)} to get back on top.` });
    }
  }
  return out;
}

/** A friend's paid ad earns the inviter a reward only once, on their first paid post. */
export function earnsReferralReward(p: { referredBy: string | null; alreadyRewarded: boolean; kind: string; paid: boolean }) {
  return p.paid && p.kind === "post" && !!p.referredBy && !p.alreadyRewarded;
}

export const freeWeeksPerReward = () => (REFERRAL.friendsNeeded === 1 ? REFERRAL.freeWeeksEarned : 0);

/** Codes are 8 lowercase letters/digits. */
export const isReferralCode = (c: string) => /^[a-z0-9]{8}$/.test(c);
