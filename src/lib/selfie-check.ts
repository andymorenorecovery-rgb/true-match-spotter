// Samples frames from the recorded selfie video and asks the server whether
// the face is visible the whole time and matches the ad's main photo.

export type SelfieResult = { ok: boolean; reason?: string; unavailable?: boolean };

const FRAMES = 6;

function toJpeg(src: CanvasImageSource, w: number, h: number, max = 384): string {
  const s = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * s);
  c.height = Math.round(h * s);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.75);
}

export async function extractFrames(video: Blob, n = FRAMES): Promise<string[]> {
  const url = URL.createObjectURL(video);
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.src = url;
  try {
    await new Promise<void>((ok, bad) => { v.onloadeddata = () => ok(); v.onerror = () => bad(new Error("video")); });
    // Recorded webm often reports Infinity duration until we seek far ahead.
    if (!isFinite(v.duration)) {
      await new Promise<void>((ok) => { v.onseeked = () => ok(); v.currentTime = 1e6; });
    }
    const d = isFinite(v.duration) && v.duration > 0 ? v.duration : 10;
    const frames: string[] = [];
    for (let i = 0; i < n; i++) {
      const t = (d * (i + 0.5)) / n;
      await new Promise<void>((ok) => { v.onseeked = () => ok(); v.currentTime = t; });
      frames.push(toJpeg(v, v.videoWidth, v.videoHeight));
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function shrinkPhoto(photo: string): Promise<string> {
  if (!photo.startsWith("data:")) return photo;
  const img = new Image();
  img.src = photo;
  await img.decode();
  return toJpeg(img, img.naturalWidth, img.naturalHeight, 512);
}

export async function checkSelfie(video: Blob, photo: string): Promise<SelfieResult> {
  let frames: string[];
  try {
    frames = await extractFrames(video);
  } catch {
    return { ok: false, reason: "We couldn't read your video. Please record it again." };
  }
  try {
    const res = await fetch("/api/public/verify-selfie", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ frames, photo: await shrinkPhoto(photo) }),
    });
    const r = (await res.json()) as { ok?: boolean; reason?: string; error?: string };
    if (!res.ok || r.error) return { ok: false, unavailable: true };
    return { ok: !!r.ok, ...(r.reason ? { reason: r.reason } : {}) };
  } catch {
    return { ok: false, unavailable: true };
  }
}
