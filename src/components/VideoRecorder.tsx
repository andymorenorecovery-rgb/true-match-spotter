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

  const startCamera = async () => {
    setErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 480, height: 640 }, audio: true });
      stream.current = s;
      setState("ready");
      requestAnimationFrame(() => { if (live.current) { live.current.srcObject = s; live.current.play().catch(() => {}); } });
    } catch {
      setErr("We couldn't open your camera. Please allow camera and microphone access and try again.");
    }
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
        {state === "recording" && <p className="text-sm text-muted-foreground">Look at the camera and say hi…</p>}
      </div>
      {err && <p className="mt-2 text-center text-xs text-destructive">{err}</p>}
    </div>
  );
}
