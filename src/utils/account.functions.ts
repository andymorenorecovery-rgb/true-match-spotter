import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";
import { LAUNCH, PRICING, REFERRAL } from "@/lib/pricing";
import { earnsReferralReward, isReferralCode, remindersFor, type AdRecord } from "@/lib/rewards";

const AD_ID = /^[a-zA-Z0-9_-]{1,60}$/;
const cleanTitle = (t: unknown) => (typeof t === "string" ? t.slice(0, 120) : "");
const hours = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

/** Profile, ads and notifications for the signed-in user (adds any new reminders first). */
export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: ads }] = await Promise.all([
      supabase.from("profiles").select("referral_code, free_week_credits, referred_by").eq("id", userId).maybeSingle(),
      supabase.from("user_ads").select("ad_id, title, plan, expires_at, boost_until").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    const due = remindersFor((ads ?? []) as AdRecord[]).map((r) => ({ ...r, user_id: userId }));
    if (due.length) await supabase.from("notifications").upsert(due, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true });
    const { data: notes } = await supabase
      .from("notifications").select("id, kind, ad_id, message, read_at, created_at")
      .eq("user_id", userId).order("created_at", { ascending: false }).limit(30);
    // Runs as the signed-in user (no admin key needed, so self-hosted servers work too).
    const { data: launch } = await supabase.rpc("launch_status", { _limit: LAUNCH.freeSpots });
    const row = Array.isArray(launch) ? launch[0] : launch;
    const launchSpotsLeft = row?.spots_left ?? 0;
    const launchFree = !row?.already_claimed && launchSpotsLeft > 0;
    return { profile: profile ?? null, ads: ads ?? [], notifications: notes ?? [], launchFree, launchSpotsLeft };
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", context.userId).is("read_at", null);
    return { ok: true };
  });

/** Links a new account to the friend who invited them. Only works before their first ad. */
export const claimReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { code: string }) => {
    if (!isReferralCode(d.code)) throw new Error("Invalid code");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: me } = await supabase.from("profiles").select("referred_by, referral_code").eq("id", userId).maybeSingle();
    if (!me || me.referred_by || me.referral_code === data.code) return { ok: false };
    const { count } = await supabase.from("user_ads").select("ad_id", { count: "exact", head: true }).eq("user_id", userId);
    if (count) return { ok: false };
    const { data: ok } = await supabase.rpc("claim_referral", { _code: data.code });
    return { ok: !!ok };
  });

/** Records a paid checkout on the account: saves the ad/boost and pays out invite rewards. */
export const recordCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { sessionId: string; environment: StripeEnv; title?: string }) => {
    if (!/^cs_[a-zA-Z0-9_]+$/.test(d.sessionId)) throw new Error("Invalid session");
    if (d.environment !== "sandbox" && d.environment !== "live") throw new Error("Invalid env");
    return { ...d, title: cleanTitle(d.title) };
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const s = await createStripeClient(data.environment).checkout.sessions.retrieve(data.sessionId);
    const paid = s.payment_status !== "unpaid" && s.status === "complete";
    const adId = s.metadata?.["adId"] ?? "";
    const kind = s.metadata?.["kind"] ?? "";
    const items = (s.metadata?.["items"] ?? "").split(",");
    if (!paid || !AD_ID.test(adId)) return { ok: false };

    const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
    const { error: dup } = await db.from("used_checkouts").insert({ session_id: data.sessionId, user_id: userId });
    if (dup) return { ok: true, alreadyRecorded: true };

    if (kind === "boost") {
      await db.from("user_ads").update({ boost_until: hours(PRICING.boost.durationHours) }).eq("ad_id", adId).eq("user_id", userId);
      return { ok: true };
    }
    const month = items.includes("month_ad_once");
    const week = items.includes("week_ad_once");
    const boosted = month || week || items.includes("boost_once");
    await db.from("user_ads").upsert({
      ad_id: adId, user_id: userId, title: data.title, plan: month ? "month" : week ? "week" : "day",
      expires_at: hours(month ? PRICING.monthAd.durationHours : week ? PRICING.weekAd.durationHours : PRICING.dayAd.durationHours),
      boost_until: boosted
        ? hours(month ? PRICING.monthAd.includedBoostHours : week ? PRICING.weekAd.includedBoostHours : PRICING.boost.durationHours)
        : null,
    });

    const { data: me } = await db.from("profiles").select("referred_by, referral_rewarded").eq("id", userId).maybeSingle();
    if (me && earnsReferralReward({ referredBy: me.referred_by, alreadyRewarded: me.referral_rewarded, kind, paid })) {
      const { data: flipped } = await db.from("profiles").update({ referral_rewarded: true }).eq("id", userId).eq("referral_rewarded", false).select("id");
      if (flipped?.length && me.referred_by) {
        const { data: inv } = await db.from("profiles").select("free_week_credits").eq("id", me.referred_by).single();
        await db.from("profiles").update({ free_week_credits: (inv?.free_week_credits ?? 0) + REFERRAL.freeWeeksPerFriend }).eq("id", me.referred_by);
        await db.from("notifications").insert({
          user_id: me.referred_by, dedupe_key: `reward:${userId}`, kind: "reward",
          message: "A friend you invited just posted their first ad. You earned a free 1-week ad!",
        });
      }
    }
    return { ok: true };
  });

/** Spends one free week credit to post an ad. */
export const redeemFreeWeek = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { adId: string; title?: string }) => {
    if (!AD_ID.test(d.adId)) throw new Error("Invalid ad");
    return { ...d, title: cleanTitle(d.title) };
  })
  .handler(async ({ data, context }) => {
    // Free credit first, otherwise a launch spot — decided atomically in the database.
    const { data: ok, error } = await context.supabase.rpc("redeem_free_week", {
      _ad_id: data.adId, _title: data.title, _launch_limit: LAUNCH.freeSpots,
      _expires_at: hours(PRICING.weekAd.durationHours), _boost_until: hours(PRICING.weekAd.includedBoostHours),
    });
    return { ok: !error && !!ok };
  });
