import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Phone, Star } from "lucide-react";
import { boostLocalAd, isOwnAd } from "@/lib/local-ads";
import { PRICING, formatPrice } from "@/lib/pricing";
import { CATEGORIES, DETAIL_FIELDS, formatLocation, getPhotos, isFeatured, type Listing } from "@/lib/listings";

export function PhotoGallery({ l }: { l: Listing }) {
  const photos = getPhotos(l);
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => (x + d + photos.length) % photos.length);
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted">
        <img src={photos[i]} alt={`${l.name} photo ${i + 1}`} className="h-full w-full object-cover" />
        {photos.length > 1 && (
          <>
            <button aria-label="Previous photo" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-overlay/70 text-foreground backdrop-blur"><ChevronLeft /></button>
            <button aria-label="Next photo" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-overlay/70 text-foreground backdrop-blur"><ChevronRight /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-overlay/70 px-3 py-1 text-xs">{i + 1} / {photos.length}</span>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {photos.map((p, n) => (
            <button key={n} onClick={() => setI(n)} aria-label={`Show photo ${n + 1}`} className={`aspect-square overflow-hidden rounded-xl border-2 ${n === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <img src={p} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingInfo({ l }: { l: Listing }) {
  const [boosted, setBoosted] = useState(false);
  const rows = [{ label: "Age", value: String(l.age) }, ...DETAIL_FIELDS.map((f) => ({ label: f.label, value: l.details[f.key] }))].filter((r) => r.value);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {isFeatured(l) && <span className="inline-flex items-center gap-1 rounded-full bg-boost px-3 py-1 text-xs font-semibold text-background"><Star className="h-3 w-3 fill-current" /> Boosted</span>}
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
      {isOwnAd(l.id) && (
        <div className="mt-4 rounded-2xl border border-boost p-4 text-center">
          <button
            onClick={() => { boostLocalAd(l.id, PRICING.boost.durationHours); setBoosted(true); }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-boost py-3 font-semibold text-background shadow-boost"
          >
            <Star className="h-4 w-4 fill-current" /> Boost to the top — {formatPrice(PRICING.boost.priceCents)}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            {boosted ? "Boosted! Your ad is back on top for the next 24 hours." : `This is your ad. Boosting puts it first with a green glow for ${PRICING.boost.durationHours} hours. Test mode — no charge.`}
          </p>
        </div>
      )}
    </div>
  );
}
