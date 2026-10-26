import { createServerFn } from "@tanstack/react-start";
import { CATEGORIES, type Category, type Listing } from "@/lib/listings";
import { adWindowFromCheckouts, type AdWindow, type PaidCheckout } from "@/lib/ad-window";
import type { StripeEnv } from "@/lib/stripe.server";

const AD_ID = /^[a-zA-Z0-9_-]{1,60}$/;
const PATH = /^ads\/[a-zA-Z0-9_-]{1,60}\/[a-zA-Z0-9_.-]{1,80}$/;
const SESSION = /^cs_[a-zA-Z0-9_]+$/;

export type AdInput = {
  id: string; title: string; name: string; age: number; city: string; state: string; area: string;
  category: Category; body: string; phone?: string; details: Record<string, string>;
  img: string; photos: string[]; video?: string;
};

const str = (v: unknown, max: number, field: string) => {
  if (typeof v !== "string" || v.length > max) throw new Error(`Invalid ${field}`);
  return v;
};

function cleanAd(a: AdInput): AdInput {
  if (!a || !AD_ID.test(a.id)) throw new Error("Invalid ad");
  const age = Number(a.age);
  if (!Number.isInteger(age) || age < 18 || age > 99) throw new Error("Invalid age");
  if (!CATEGORIES.some((c) => c.id === a.category)) throw new Error("Invalid category");
  if (!PATH.test(a.img) || !Array.isArray(a.photos) || a.photos.length > 9 || !a.photos.every((p) => PATH.test(p))) throw new Error("Invalid photos");
  if (a.video !== undefined && !PATH.test(a.video)) throw new Error("Invalid video");
  const details: Record<string, string> = {};
  for (const [k, v] of Object.entries(a.details ?? {}).slice(0, 30)) {
    if (/^[a-zA-Z]{1,30}$/.test(k) && typeof v === "string" && v) details[k] = v.slice(0, 200);
  }
  const out: AdInput = {
    id: a.id, title: str(a.title, 120, "title"), name: str(a.name, 60, "name"), age,
    city: str(a.city, 80, "city"), state: str(a.state, 4, "state"), area: str(a.area ?? "", 80, "area"),
    category: a.category, body: str(a.body, 4000, "text"), details, img: a.img, photos: a.photos,
  };
  if (a.phone) out.phone = str(a.phone, 30, "phone");
  if (a.video) out.video = a.video;
  return out;
}

/**
 * Shares an ad with everyone. It only goes live when the server can prove it was
 * paid (Stripe checkouts for this ad) or it's a free ad on the signed-in owner's account.
 * Times always come from those records, never from the browser.
 */
export const publishAd = createServerFn({ method: "POST" })
  .inputValidator((d: { ad: AdInput; sessionIds: string[]; environment: StripeEnv }) => {
    if (d.environment !== "sandbox" && d.environment !== "live") throw new Error("Invalid env");
    const sessionIds = [...new Set((Array.isArray(d.sessionIds) ? d.sessionIds : []).filter((s) => typeof s === "string" && SESSION.test(s)))].slice(-20);
    return { ad: cleanAd(d.ad), sessionIds, environment: d.environment };
  })
  .handler(async ({ data }): Promise<{ ok: true; plan: AdWindow["plan"]; expiresAt: string; featuredUntil: string | null } | { ok: false; reason: string }> => {
    const { adsDb } = await import("@/lib/ads.server");
    const { ad } = data;
    const checkouts: PaidCheckout[] = [];
    if (data.sessionIds.length) {
      const { createStripeClient } = await import("@/lib/stripe.server");
      const stripe = createStripeClient(data.environment);
      await Promise.all(data.sessionIds.map(async (id) => {
        try {
          const s = await stripe.checkout.sessions.retrieve(id);
          const paid = s.payment_status !== "unpaid" && s.status === "complete";
          if (paid && s.metadata?.["adId"] === ad.id) {
            checkouts.push({ createdMs: s.created * 1000, kind: s.metadata?.["kind"] ?? "", items: (s.metadata?.["items"] ?? "").split(",") });
          }
        } catch { /* unknown session: ignore */ }
      }));
    }
    let base: AdWindow | null = null;
    if (!checkouts.some((c) => c.kind === "post")) {
      // Free ads: the signed-in owner's account holds the record.
      const { getRequest } = await import("@tanstack/react-start/server");
      const token = getRequest()?.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
      if (token) {
        const { data: row } = await adsDb(token).from("user_ads").select("plan, created_at, expires_at, boost_until").eq("ad_id", ad.id).maybeSingle();
        if (row) base = { plan: row.plan === "month" ? "month" : row.plan === "day" ? "day" : "week", postedAt: row.created_at, expiresAt: row.expires_at, boostUntil: row.boost_until };
      }
    }
    const w = adWindowFromCheckouts(checkouts, base);
    if (!w) return { ok: false, reason: "not-paid" };
    const secret = process.env["AD_PUBLISH_SECRET"];
    if (!secret) return { ok: false, reason: "server-not-ready" };
    const { id, ...rest } = ad;
    const { data: ok, error } = await adsDb().rpc("publish_ad", {
      _secret: secret, _id: id, _data: { ...rest, plan: w.plan },
      _posted_at: w.postedAt, _expires_at: w.expiresAt, _boost_until: w.boostUntil as string,
    });
    if (error || !ok) return { ok: false, reason: "save-failed" };
    return { ok: true, plan: w.plan, expiresAt: w.expiresAt, featuredUntil: w.boostUntil };
  });

/** Every live ad, for everyone. */
export const listPublicAds = createServerFn({ method: "GET" }).handler(async (): Promise<Listing[]> => {
  try {
    const { adsDb, rowsToListings } = await import("@/lib/ads.server");
    const db = adsDb();
    const { data } = await db.from("ads").select("id, data, posted_at, expires_at, boost_until").order("posted_at", { ascending: false }).limit(500);
    return await rowsToListings(db, data ?? []);
  } catch (e) {
    console.error("listPublicAds", e);
    return [];
  }
});

export const getPublicAd = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => {
    if (!AD_ID.test(d.id)) throw new Error("Invalid ad");
    return d;
  })
  .handler(async ({ data }): Promise<Listing | null> => {
    try {
      const { adsDb, rowsToListings } = await import("@/lib/ads.server");
      const db = adsDb();
      const { data: row } = await db.from("ads").select("id, data, posted_at, expires_at, boost_until").eq("id", data.id).maybeSingle();
      return row ? (await rowsToListings(db, [row]))[0] ?? null : null;
    } catch {
      return null;
    }
  });

/**
 * Removes an ad for everyone. Only the owner can do it: they must hold a paid
 * checkout for this ad, or the ad must be on their signed-in account.
 */
export const deleteAd = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; sessionIds: string[]; environment: StripeEnv }) => {
    if (!AD_ID.test(d.id)) throw new Error("Invalid ad");
    if (d.environment !== "sandbox" && d.environment !== "live") throw new Error("Invalid env");
    const sessionIds = [...new Set((Array.isArray(d.sessionIds) ? d.sessionIds : []).filter((s) => typeof s === "string" && SESSION.test(s)))].slice(-20);
    return { id: d.id, sessionIds, environment: d.environment };
  })
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    const { adsDb } = await import("@/lib/ads.server");
    let owner = false;
    let userId: string | null = null;
    const { getRequest } = await import("@tanstack/react-start/server");
    const token = getRequest()?.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (token) {
      const db = adsDb(token);
      const { data: row } = await db.from("user_ads").select("user_id").eq("ad_id", data.id).maybeSingle();
      if (row) { owner = true; userId = row.user_id; }
    }
    if (!owner && data.sessionIds.length) {
      const { createStripeClient } = await import("@/lib/stripe.server");
      const stripe = createStripeClient(data.environment);
      for (const sid of data.sessionIds) {
        try {
          const s = await stripe.checkout.sessions.retrieve(sid);
          if (s.status === "complete" && s.payment_status !== "unpaid" && s.metadata?.["adId"] === data.id) { owner = true; break; }
        } catch { /* ignore */ }
      }
    }
    if (!owner) return { ok: false };
    const secret = process.env["AD_PUBLISH_SECRET"];
    if (!secret) return { ok: false };
    const { data: ok, error } = await adsDb().rpc("delete_ad", { _secret: secret, _id: data.id, _user_id: userId as string });
    return { ok: !error && !!ok };
  });
