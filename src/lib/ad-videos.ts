// Test-mode storage for the required 10-second "I'm real" selfie video.
// Videos are too big for localStorage, so they live in the browser's IndexedDB.
import { useEffect, useState } from "react";

export const VIDEO_SECONDS = 10;
const DB = "rtm-videos";
const STORE = "videos";

function open(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function saveAdVideo(id: string, blob: Blob) {
  const db = await open();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function getAdVideo(id: string): Promise<Blob | undefined> {
  if (typeof indexedDB === "undefined") return undefined;
  const db = await open();
  return new Promise((res) => {
    const r = db.transaction(STORE).objectStore(STORE).get(id);
    r.onsuccess = () => res(r.result as Blob | undefined);
    r.onerror = () => res(undefined);
  });
}

export function useAdVideo(id: string) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    getAdVideo(id).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u); } }).catch(() => {});
    return () => { if (u) URL.revokeObjectURL(u); };
  }, [id]);
  return url;
}

// Unfinished post-form draft (photos + video), so a phone reloading the page
// after the camera or photo picker doesn't wipe what the person already filled in.
async function putAny(key: string, value: unknown) {
  const db = await open();
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    if (value == null) tx.objectStore(STORE).delete(key);
    else tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function getAny<T>(key: string): Promise<T | undefined> {
  if (typeof indexedDB === "undefined") return undefined;
  const db = await open();
  return new Promise((res) => {
    const r = db.transaction(STORE).objectStore(STORE).get(key);
    r.onsuccess = () => res(r.result as T | undefined);
    r.onerror = () => res(undefined);
  });
}
export const saveDraftMedia = (photos: string[], video: Blob | null) =>
  Promise.all([putAny("draft:photos", photos.length ? photos : null), putAny("draft:video", video)]).catch(() => {});
export const loadDraftMedia = async () => ({
  photos: (await getAny<string[]>("draft:photos").catch(() => undefined)) ?? [],
  video: (await getAny<Blob>("draft:video").catch(() => undefined)) ?? null,
});

// Ad photos also live here (localStorage is only ~5MB on iPhones; 10 photos alone can fill it).
const PHOTO_PREFIX = "photos:";
export const putAdPhotos = (id: string, photos: string[] | null) => putAny(PHOTO_PREFIX + id, photos);
export async function getAllAdPhotos(): Promise<Map<string, string[]>> {
  const out = new Map<string, string[]>();
  if (typeof indexedDB === "undefined") return out;
  const db = await open();
  return new Promise((res) => {
    const range = IDBKeyRange.bound(PHOTO_PREFIX, PHOTO_PREFIX + "\uffff");
    const r = db.transaction(STORE).objectStore(STORE).openCursor(range);
    r.onsuccess = () => {
      const c = r.result;
      if (!c) return res(out);
      out.set(String(c.key).slice(PHOTO_PREFIX.length), c.value as string[]);
      c.continue();
    };
    r.onerror = () => res(out);
  });
}
