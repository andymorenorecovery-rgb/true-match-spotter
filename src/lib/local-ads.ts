// Test-mode storage: ads posted here live only in this browser (no accounts or payments yet).
import { useEffect, useState } from "react";
import type { Listing } from "@/lib/listings";
import { getAllAdPhotos, putAdPhotos } from "@/lib/ad-videos";

const KEY = "rtm-test-ads";
const EVENT = "rtm-test-ads-changed";

// Photos are kept in IndexedDB (roomy), not localStorage (~5MB on iPhones — ten photos
// alone could fill it and the form said "photos too big"). localStorage keeps the text.
type Stored = Listing & { photosInDb?: boolean };
const photoCache = new Map<string, string[]>();
const writes = new Set<Promise<unknown>>();
const track = (p: Promise<unknown>) => { const q = p.catch(() => {}).finally(() => writes.delete(q)); writes.add(q); };
/** Waits until every photo is safely saved on the device. */
export const flushPhotos = () => Promise.all([...writes]).then(() => {});

const hasInline = (a: Stored) => !!a.img?.startsWith("data:") || !!a.photos?.some((p) => p.startsWith("data:"));
const same = (a: string[], b: string[]) => a.length === b.length && a.every((p, i) => p === b[i]);

function strip(a: Stored): Stored {
  if (!hasInline(a)) return a;
  const all = [a.img, ...(a.photos ?? [])];
  const prev = photoCache.get(a.id);
  photoCache.set(a.id, all);
  if (!prev || !same(prev, all)) track(putAdPhotos(a.id, all));
  return { ...a, img: "", photos: [], photosInDb: true };
}

function merge(a: Stored): Listing {
  if (!a.photosInDb) return a;
  const p = photoCache.get(a.id);
  if (!p) return a;
  const { photosInDb: _x, ...rest } = a;
  return { ...rest, img: p[0] ?? "", photos: p.slice(1) };
}

function readRaw(): Stored[] {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}
function readPending(): Record<string, Stored> {
  try { return JSON.parse(localStorage.getItem(PENDING) ?? "{}"); } catch { return {}; }
}
const writeAds = (list: Listing[]) => safeSet(KEY, JSON.stringify(list.map(strip)));

let readyPromise: Promise<void> | null = null;
let loaded = false;
/** Loads the saved photos and moves any still sitting in localStorage (older ads) out of it. */
export function localAdsReady(): Promise<void> {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") return Promise.resolve();
  if (!readyPromise) {
    readyPromise = (async () => {
      const saved = await getAllAdPhotos().catch(() => new Map<string, string[]>());
      for (const [id, p] of saved) if (!photoCache.has(id)) photoCache.set(id, p);
      try {
        const raw = readRaw();
        const pend = readPending();
        if (raw.some(hasInline) || Object.values(pend).some(hasInline)) {
          const ads = raw.map(strip);
          const pending = Object.fromEntries(Object.entries(pend).map(([k, v]) => [k, strip(v)]));
          await flushPhotos();
          localStorage.setItem(KEY, JSON.stringify(ads));
          localStorage.setItem(PENDING, JSON.stringify(pending));
        }
        // Forget photos of ads that no longer exist on this device.
        const live = new Set([...readRaw().map((a) => a.id), ...Object.keys(readPending())]);
        for (const id of saved.keys()) if (!live.has(id)) { photoCache.delete(id); track(putAdPhotos(id, null)); }
      } catch { /* keep going with what we have */ }
      loaded = true;
    })();
  }
  return readyPromise;
}

/** Saves to browser storage; if the phone's storage is full, clears leftovers (old drafts,
 *  abandoned checkouts, expired ads) and tries again. */
function safeSet(key: string, value: string, keepPending?: string) {
  try { return localStorage.setItem(key, value); } catch { /* full — free space below */ }
  try { localStorage.removeItem("rtm-post-draft"); } catch { /* */ }
  try {
    const pend = readPending();
    const keep = keepPending && pend[keepPending] ? { [keepPending]: pend[keepPending] } : {};
    if (key !== PENDING) localStorage.setItem(PENDING, JSON.stringify(keep));
    else localStorage.removeItem(PENDING);
  } catch { /* */ }
  if (key !== KEY) {
    try {
      const now = Date.now();
      localStorage.setItem(KEY, JSON.stringify(readRaw().filter((a) => !a.expiresAt || new Date(a.expiresAt).getTime() > now)));
    } catch { /* */ }
  }
  localStorage.setItem(key, value);
}

export function loadLocalAds(): Listing[] {
  return readRaw().map(merge);
}

export function saveLocalAd(ad: Listing) {
  writeAds([ad, ...loadLocalAds()]);
  window.dispatchEvent(new Event(EVENT));
}

/** The owner's copy of each ad lives on the device it was posted from. */
export const isOwnAd = (id: string) => loadLocalAds().some((a) => a.id === id);

export function useIsOwnAd(id: string) {
  const ads = useLocalAds();
  return ads.some((a) => a.id === id);
}

/** Puts the ad back on top for another boost period (starts now). */
export function boostLocalAd(id: string, hours: number) {
  const all = loadLocalAds().map((a) =>
    a.id === id ? { ...a, featuredUntil: new Date(Date.now() + hours * 3600000).toISOString() } : a,
  );
  writeAds(all);
  window.dispatchEvent(new Event(EVENT));
}

/** Saves edits to an ad that's already live (same id, plan and expiry). */
export function updateLocalAd(ad: Listing) {
  writeAds(loadLocalAds().map((a) => (a.id === ad.id ? ad : a)));
  window.dispatchEvent(new Event(EVENT));
}

export function clearLocalAds() {
  localStorage.removeItem(KEY);
  for (const id of photoCache.keys()) track(putAdPhotos(id, null));
  photoCache.clear();
  window.dispatchEvent(new Event(EVENT));
}

export function useLocalAds() {
  const [ads, setAds] = useState<Listing[]>([]);
  useEffect(() => {
    const sync = () => setAds(loadLocalAds());
    if (loaded) sync();
    localAdsReady().then(sync);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return ads;
}

/** True once the saved photos have been loaded on this device. */
export function useLocalAdsLoaded() {
  const [ok, setOk] = useState(loaded);
  useEffect(() => { localAdsReady().then(() => setOk(true)); }, []);
  return ok;
}

/** Shrinks a photo so several fit in browser storage. */
export function resizeImage(file: File, max = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Ads waiting for payment. They only go live after the server confirms checkout was paid.
const PENDING = "rtm-pending-ads";
const USED = "rtm-used-sessions";

/** Saves the ad while it waits for payment; resolves once its photos are stored. */
export async function savePendingAd(ad: Listing) {
  const all = { ...readPending(), [ad.id]: strip(ad) };
  try {
    localStorage.setItem(PENDING, JSON.stringify(all));
  } catch {
    safeSet(PENDING, JSON.stringify({ [ad.id]: all[ad.id] }));
  }
  await flushPhotos();
}

/** Marks a paid checkout as used; returns false if it was already applied. */
export function claimSession(sessionId: string): boolean {
  const used: string[] = JSON.parse(localStorage.getItem(USED) ?? "[]");
  if (used.includes(sessionId)) return false;
  localStorage.setItem(USED, JSON.stringify([...used, sessionId]));
  return true;
}

/** Paid checkouts made on this device (sent to the server as proof of payment). */
export function usedSessions(): string[] {
  try {
    return JSON.parse(localStorage.getItem(USED) ?? "[]");
  } catch {
    return [];
  }
}

export function publishPendingAd(id: string): boolean {
  const all = readPending();
  const ad = all[id];
  if (!ad) return false;
  const shift = Date.now() - new Date(ad.postedAt).getTime();
  const move = (iso?: string) => (iso ? new Date(new Date(iso).getTime() + shift).toISOString() : undefined);
  saveLocalAd({ ...ad, postedAt: new Date().toISOString(), expiresAt: move(ad.expiresAt)!, ...(ad.featuredUntil ? { featuredUntil: move(ad.featuredUntil)! } : {}) });
  delete all[id];
  localStorage.setItem(PENDING, JSON.stringify(all));
  return true;
}

export function pendingAdTitle(id: string): string {
  try {
    return (JSON.parse(localStorage.getItem(PENDING) ?? "{}")[id] as Listing | undefined)?.title ?? "";
  } catch {
    return "";
  }
}

/** Removes the ad from this device. */
export function removeLocalAd(id: string) {
  safeSet(KEY, JSON.stringify(readRaw().filter((a) => a.id !== id)));
  photoCache.delete(id);
  track(putAdPhotos(id, null));
  window.dispatchEvent(new Event(EVENT));
}
