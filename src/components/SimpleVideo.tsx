import { useRef, useState } from "react";
import { Play } from "lucide-react";

/** Clean tap-to-play video: no phone player buttons (skip 10s, fullscreen, picture-in-picture). */
export function SimpleVideo({ src, autoPlay = false, className = "", natural = false }: { src: string; autoPlay?: boolean; className?: string; natural?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    if (v.paused) v.play().catch(() => {}); else v.pause();
  };
  return (
    <div className={`relative w-full ${natural ? "" : "h-full"} ${className}`} onClick={toggle}>
      <video
        ref={ref}
        src={`${src}#t=0.1`}
        autoPlay={autoPlay}
        muted={autoPlay}
        preload="auto"
        playsInline
        disablePictureInPicture
        controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className={natural ? "block h-auto max-h-[80vh] w-full object-contain bg-muted" : "h-full w-full object-contain bg-muted"}
      />
      {!playing && (
        <button type="button" aria-label="Play video" className="absolute inset-0 grid place-items-center bg-overlay/30">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="ml-1 h-7 w-7" fill="currentColor" />
          </span>
        </button>
      )}
    </div>
  );
}
