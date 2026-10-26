// Test-mode storage: ads posted here live only in this browser (no accounts or payments yet).
import { useEffect, useState } from "react";
import type { Listing } from "@/lib/listings";

const KEY = "rtm-test-ads";
const EVENT = "rtm-test-ads-changed";

export function loadLocalAds(): Listing[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveLocalAd(ad: Listing) {
  const all = [ad, ...loadLocalAds()];
  localStorage.setItem(KEY, JSON.stringify(all));
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
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT));
}

/** Saves edits to an ad that's already live (same id, plan and expiry). */
export function updateLocalAd(ad: Listing) {
  const all = loadLocalAds().map((a) => (a.id === ad.id ? ad : a));
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(EVENT));
}

export function clearLocalAds() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function useLocalAds() {
  const [ads, setAds] = useState<Listing[]>([]);
  useEffect(() => {
    const sync = () => setAds(loadLocalAds());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return ads;
}

/** Shrinks a photo so several fit in browser storage. */
export function resizeImage(file: File, max = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Ads waiting for payment. They only go live after the server confirms checkout was paid.
const PENDING = "rtm-pending-ads";
const USED = "rtm-used-sessions";

export function savePendingAd(ad: Listing) {
  const all = { ...JSON.parse(localStorage.getItem(PENDING) ?? "{}"), [ad.id]: ad };
  localStorage.setItem(PENDING, JSON.stringify(all));
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
  const all = JSON.parse(localStorage.getItem(PENDING) ?? "{}");
  const ad = all[id] as Listing | undefined;
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
