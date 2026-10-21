import { useEffect, useRef, useState } from "react";
import { RotateCcw, Video } from "lucide-react";
import { VIDEO_SECONDS } from "@/lib/ad-videos";

/** Live camera only — no file upload — so the person must film themselves. */
export function VideoRecorder({ value, onChange }: { value: Blob | null; onChange: (b: Blob | null) => void }) {
  const live = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [state, setState] = useState<"idle" | "ready" | "recording">("idle");
  const [left, setLeft] = useState(VIDEO_SECONDS);
  const [err, setErr] = useState("");
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) return setUrl(null);
    const u = URL.createObjectURL(value);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [value]);
  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);
  // Attach the camera once the live <video> is on screen (phones need muted + playsInline + autoplay).
  useEffect(() => {
    const v = live.current;
    if (state === "idle" || !v || !stream.current) return;
    if (v.srcObject !== stream.current) v.srcObject = stream.current;
    v.play().catch(() => {});
  }, [state]);

  const startCamera = async () => {
    setErr("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      return setErr("This browser can't record video. Please open the site in Safari (iPhone) or Chrome (Android).");
    }
    const tries: MediaStreamConstraints[] = [
      { video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 640 } }, audio: true },
      { video: { facingMode: "user" }, audio: true },
      { video: true, audio: true },
      { video: true },
    ];
    let lastErr: unknown;
    for (const c of tries) {
      try {
        stream.current = await navigator.mediaDevices.getUserMedia(c);
        setState("ready");
        return;
      } catch (e) {
        lastErr = e;
        if ((e as DOMException)?.name === "NotAllowedError") break;
      }
    }
    const name = (lastErr as DOMException)?.name;
    setErr(name === "NotAllowedError"
      ? "Camera access was blocked. Go to your phone's browser settings, allow Camera and Microphone for this site, then tap Open camera again."
      : "We couldn't open your camera. Close other apps using the camera and try again.");
  };

  const record = () => {
    const s = stream.current;
    if (!s) return;
    const type = ["video/mp4", "video/webm;codecs=vp8,opus", "video/webm"].find((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(s, { ...(type ? { mimeType: type } : {}), videoBitsPerSecond: 800_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = () => {
      s.getTracks().forEach((t) => t.stop());
      stream.current = null;
      setState("idle");
      onChange(new Blob(chunks, { type: rec.mimeType || "video/webm" }));
    };
    rec.start();
    setState("recording");
    setLeft(VIDEO_SECONDS);
    let n = VIDEO_SECONDS;
    const t = setInterval(() => {
      n -= 1;
      setLeft(n);
      if (n <= 0) { clearInterval(t); rec.stop(); }
    }, 1000);
  };

  return (
    <div>
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-2xl bg-muted">
        {state !== "idle" ? (
          <video ref={live} muted playsInline className="h-full w-full -scale-x-100 object-cover" />
        ) : url ? (
          <video src={url} controls playsInline className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted-foreground">
            <Video className="h-8 w-8" /> Your {VIDEO_SECONDS}-second video shows people you're real.
          </div>
        )}
        {state === "recording" && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-destructive-foreground" /> REC {left}s
          </span>
        )}
      </div>
      <div className="mt-3 flex justify-center">
        {state === "idle" && (
          <button type="button" onClick={startCamera} className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {value ? <><RotateCcw className="h-4 w-4" /> Record again</> : <><Video className="h-4 w-4" /> Open camera</>}
          </button>
        )}
        {state === "ready" && (
          <button type="button" onClick={record} className="rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground">
            Start {VIDEO_SECONDS}-second recording
          </button>
        )}
        {state === "recording" && <p className="text-sm text-muted-foreground">Look at the camera and talk…</p>}
      </div>
      <div className="mx-auto mt-3 max-w-[280px] rounded-xl border bg-secondary/40 p-3 text-sm">
        <p className="font-semibold">In your video, tell people:</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-muted-foreground">
          <li>How old you are</li>
          <li>Where you're from</li>
          <li>What you like to do</li>
        </ol>
      </div>
      {err && <p className="mt-2 text-center text-xs text-destructive">{err}</p>}
    </div>
  );
}
