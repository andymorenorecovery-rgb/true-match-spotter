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
