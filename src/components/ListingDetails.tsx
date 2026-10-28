import { useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight, Calendar, Flag, MapPin, Phone, Play, Star } from "lucide-react";
import { useIsOwnAd } from "@/lib/local-ads";
import { FitImage } from "@/components/FitImage";
import { SimpleVideo } from "@/components/SimpleVideo";
import { useAdVideo } from "@/lib/ad-videos";
import { PRICING, PRICE_IDS, formatPrice } from "@/lib/pricing";
import { CATEGORIES, DETAIL_FIELDS, formatLocation, getPhotos, isFeatured, type Listing } from "@/lib/listings";
import { CheckoutDialog } from "@/components/CheckoutDialog";

export function PhotoGallery({ l }: { l: Listing }) {
  const videoUrl = useAdVideo(l.id) ?? l.video ?? null;
  const media: { kind: "photo" | "video"; src: string }[] = [
    ...getPhotos(l).map((src) => ({ kind: "photo" as const, src })),
    ...(videoUrl ? [{ kind: "video" as const, src: videoUrl }] : []),
  ];
  const [i, setI] = useState(0);
  const cur = media[Math.min(i, media.length - 1)]!;
  const go = (d: number) => setI((x) => (x + d + media.length) % media.length);
  // Hold the photo's space until it loads so the page doesn't jump after posting.
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const waiting = cur.kind === "photo" && !loaded[cur.src];
  return (
    <div>
      <div className={`relative overflow-hidden rounded-2xl bg-muted ${waiting ? "aspect-[3/4] animate-pulse" : ""}`}>
        {cur.kind === "video" ? (
          <SimpleVideo key={cur.src} src={cur.src} autoPlay natural />
        ) : (
          <img src={cur.src} alt={`${l.name} photo ${i + 1}`} onLoad={() => setLoaded((m) => ({ ...m, [cur.src]: true }))} ref={(el) => { if (el?.complete && el.naturalWidth && !loaded[cur.src]) setLoaded((m) => ({ ...m, [cur.src]: true })); }} className={waiting ? "absolute inset-0 h-full w-full object-contain" : "block h-auto w-full"} />
        )}
        {videoUrl && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"><BadgeCheck className="h-3.5 w-3.5" /> Video verified</span>
        )}
        {media.length > 1 && (
          <>
            <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-overlay/70 text-foreground backdrop-blur"><ChevronLeft /></button>
            <button aria-label="Next" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-overlay/70 text-foreground backdrop-blur"><ChevronRight /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-overlay/70 px-3 py-1 text-xs">{i + 1} / {media.length}</span>
          </>
        )}
      </div>
      {media.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {media.map((m, n) => (
            <button key={n} onClick={() => setI(n)} aria-label={m.kind === "video" ? "Play video" : `Show photo ${n + 1}`} className={`relative h-28 overflow-hidden rounded-xl border-2 bg-muted sm:h-36 ${n === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {m.kind === "video" ? (
                <>
                  <video src={`${m.src}#t=0.5`} muted playsInline preload="metadata" className="block h-full w-auto" />
                  <span className="absolute inset-0 grid place-items-center"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Play className="ml-0.5 h-4 w-4" fill="currentColor" /></span></span>
                </>
              ) : (
                <img src={m.src} alt="" loading="lazy" className="block h-full w-auto" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingInfo({ l }: { l: Listing }) {
  const [boosted, setBoosted] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const own = useIsOwnAd(l.id);
  const rows = [{ label: "Age", value: String(l.age) }, ...DETAIL_FIELDS.map((f) => ({ label: f.label, value: l.details[f.key] }))].filter((r) => r.value);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {isFeatured(l) && <span className="inline-flex items-center gap-1 rounded-full bg-boost px-3 py-1 text-xs font-semibold text-background"><Star className="h-3 w-3 fill-primary text-primary" /> Boosted</span>}
        <span className="rounded-full bg-secondary px-3 py-1 text-xs">{CATEGORIES.find((c) => c.id === l.category)?.label}</span>
      </div>
      <h2 className="mt-3 text-3xl font-bold">{l.title}</h2>
      <p className="mt-1 text-muted-foreground">{l.name}, {l.age}</p>
      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{formatLocation(l)}</p>
        <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />Posted {new Date(l.postedAt).toLocaleDateString()}</p>
      </div>
      <dl className="mt-6 flex flex-wrap overflow-hidden rounded-2xl border bg-card">
        {rows.map((r) => (
          <div key={r.label} className="grow basis-1/2 px-4 py-3 shadow-[0_0_0_0.5px_var(--color-border)] sm:basis-1/3">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.label}</dt>
            <dd className="mt-0.5 font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 whitespace-pre-line leading-relaxed">{l.body}</p>
      {l.phone ? (
        <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-3 font-semibold text-primary-foreground shadow-glow">
          <Phone className="h-4 w-4" /> {l.phone}
        </a>
      ) : (
        <p className="mt-8 rounded-full bg-secondary py-3 text-center text-sm text-muted-foreground">This person chose not to share a number</p>
      )}
      {!own && (
        <div className="mt-4 text-center text-sm">
          {reported ? (
            <p className="text-muted-foreground">Thanks — this ad was reported and will be reviewed.</p>
          ) : reporting ? (
            <div className="flex flex-wrap justify-center gap-2">
              {["Nudity or sexual photos", "Selling sex / escort", "Under 18", "Fake or scam", "Harassment"].map((r) => (
                <button key={r} onClick={() => setReported(true)} className="rounded-full bg-secondary px-3 py-1.5 text-xs">{r}</button>
              ))}
            </div>
          ) : (
            <button onClick={() => setReporting(true)} className="inline-flex items-center gap-1 text-muted-foreground underline"><Flag className="h-3.5 w-3.5" /> Report this ad</button>
          )}
        </div>
      )}
      {own && (
        <div className="mt-4 rounded-2xl border border-boost p-4 text-center">
          <button
            onClick={() => setBoosted(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-boost py-3 font-semibold text-background shadow-boost"
          >
            <Star className="h-4 w-4 fill-primary text-primary" /> Boost to the top — {formatPrice(PRICING.boost.priceCents)}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            {`This is your ad. Boosting puts it first with a green glow for ${PRICING.boost.durationHours} hours.`}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">Delete your ad anytime from My ads.</p>
          <CheckoutDialog request={boosted ? { adId: l.id, kind: "boost", priceIds: [PRICE_IDS.boost] } : null} onClose={() => setBoosted(false)} />
        </div>
      )}
    </div>
  );
}
