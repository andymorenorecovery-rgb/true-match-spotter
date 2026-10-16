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

/** Test mode: ads saved on this device are the visitor's own. */
export const isOwnAd = (id: string) => id.startsWith("local-");

/** Puts the ad back on top for another boost period (starts now). */
export function boostLocalAd(id: string, hours: number) {
  const all = loadLocalAds().map((a) =>
    a.id === id ? { ...a, featuredUntil: new Date(Date.now() + hours * 3600000).toISOString() } : a,
  );
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
