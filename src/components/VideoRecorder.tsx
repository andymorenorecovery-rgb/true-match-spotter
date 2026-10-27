import { useEffect, useRef, useState } from "react";
import { RotateCcw, Video } from "lucide-react";
import { VIDEO_SECONDS } from "@/lib/ad-videos";
import { SimpleVideo } from "@/components/SimpleVideo";

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
  // iPhone Safari only shows a live camera if the <video> is truly muted and inline
  // (React's `muted` prop doesn't set the HTML attribute), so set them by hand.
  const attach = (v: HTMLVideoElement | null) => {
    (live as React.MutableRefObject<HTMLVideoElement | null>).current = v;
    const s = stream.current;
    if (!v || !s) return;
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    v.setAttribute("autoplay", "");
    if (v.srcObject !== s) v.srcObject = s;
    const play = () => v.play().catch(() => {});
    v.onloadedmetadata = play;
    play();
  };
  useEffect(() => { if (state !== "idle") attach(live.current); }, [state]);

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
          <video ref={attach} muted autoPlay playsInline disablePictureInPicture className="h-full w-full -scale-x-100 object-cover" />
        ) : url ? (
          <SimpleVideo src={url} />
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
        {state === "recording" && <p className="text-sm text-muted-foreground">Keep your face in view and talk…</p>}
      </div>
      <div className="mx-auto mt-3 max-w-[280px] rounded-xl border bg-secondary/40 p-3 text-center text-sm text-muted-foreground">
        We're making sure you are a real person so no one can use your pics.
      </div>

      {err && <p className="mt-2 text-center text-xs text-destructive">{err}</p>}
    </div>
  );
}
