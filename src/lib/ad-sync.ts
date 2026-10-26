// Shares the owner's ads with everyone: uploads photos/video, then asks the server
// to publish (the server checks payment or the account before anything goes live).
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { getAdVideo } from "@/lib/ad-videos";
import { loadLocalAds, updateLocalAd, usedSessions } from "@/lib/local-ads";
import { publishAd } from "@/utils/ads.functions";
import type { Listing } from "@/lib/listings";

const sigOf = (photos: string[]) => photos.map((p) => `${p.length}:${p.slice(-40)}`).join("|");

async function toBlob(src: string): Promise<Blob> {
  return (await fetch(src)).blob();
}

async function upload(id: string, blob: Blob, ext: string) {
  const path = `ads/${id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("ad-media").upload(path, blob, { contentType: blob.type || (ext === "jpg" ? "image/jpeg" : "video/webm"), upsert: false });
  if (error) throw error;
  return path;
}

const busy = new Set<string>();

/** Returns true when the ad is live for everyone. */
export async function syncAd(id: string): Promise<boolean> {
  if (busy.has(id)) return false;
  busy.add(id);
  try {
    const ad = loadLocalAds().find((a) => a.id === id);
    if (!ad) return false;
    const all = [ad.img, ...(ad.photos ?? [])];
    const sig = sigOf(all);
    let remote = ad.remote && ad.remote.sig === sig ? ad.remote : undefined;
    if (!remote) {
      const paths: string[] = [];
      for (const p of all) paths.push(await upload(id, await toBlob(p), "jpg"));
      remote = { sig, img: paths[0]!, photos: paths.slice(1), ...(ad.remote?.video ? { video: ad.remote.video } : {}) };
    }
    if (!remote.video) {
      const v = await getAdVideo(id);
      if (v) remote = { ...remote, video: await upload(id, v, v.type.includes("mp4") ? "mp4" : v.type.includes("quicktime") ? "mov" : "webm") };
    }
    // Save upload progress so a retry doesn't upload again.
    updateLocalAd({ ...ad, remote });
    const r = await publishAd({
      data: {
        ad: {
          id, title: ad.title, name: ad.name, age: ad.age, city: ad.city, state: ad.state, area: ad.area,
          category: ad.category, body: ad.body, details: (ad.details ?? {}) as Record<string, string>,
          img: remote.img, photos: remote.photos,
          ...(ad.phone ? { phone: ad.phone } : {}), ...(remote.video ? { video: remote.video } : {}),
        },
        sessionIds: usedSessions(),
        environment: getStripeEnvironment(),
      },
    });
    if (!r.ok) return false;
    const latest = loadLocalAds().find((a) => a.id === id) ?? ad;
    const next: Listing = { ...latest, remote, synced: true, plan: r.plan, expiresAt: r.expiresAt };
    if (r.featuredUntil) next.featuredUntil = r.featuredUntil; else delete next.featuredUntil;
    updateLocalAd(next);
    return true;
  } catch (e) {
    console.error("Could not share ad", e);
    return false;
  } finally {
    busy.delete(id);
  }
}

/** Shares any of this device's live ads that aren't on the server yet (older ads, failed tries). */
export async function syncUnsharedAds() {
  const now = Date.now();
  for (const a of loadLocalAds()) {
    if (!a.synced && Date.parse(a.expiresAt) > now) await syncAd(a.id);
  }
}

/** Deletes an ad everywhere (server + this device). Returns false if the server refused. */
export async function deleteAdEverywhere(id: string): Promise<boolean> {
  const { deleteAd } = await import("@/utils/ads.functions");
  const { usedSessions, removeLocalAd } = await import("@/lib/local-ads");
  const res = await deleteAd({ data: { id, sessionIds: usedSessions(), environment: getStripeEnvironment() } });
  if (res.ok || id.startsWith("local-")) removeLocalAd(id);
  return res.ok;
}
