import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Images, MapPin, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ListingInfo, PhotoGallery } from "@/components/ListingDetails";
import { CATEGORIES, getPhotos, glowOf, isFeatured, type Listing } from "@/lib/listings";

export function ListingCard({ l }: { l: Listing }) {
  const [open, setOpen] = useState(false);
  const featured = isFeatured(l);
  const count = getPhotos(l).length;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`group block w-full overflow-hidden rounded-xl border bg-card text-left transition hover:-translate-y-0.5 ${featured ? "border-boost shadow-boost" : glowOf(l) === "day" ? "border-day-glow shadow-day" : ""}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <img src={l.img} alt={l.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
          {featured && (
            <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-boost px-2 py-0.5 text-[10px] font-semibold text-background">
              <Star className="h-2.5 w-2.5 fill-current" /> Boosted
            </span>
          )}
          {count > 1 && <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-overlay/70 px-1.5 py-0.5 text-[10px]"><Images className="h-2.5 w-2.5" />{count}</span>}
        </div>
        <div className="p-2.5">
          <p className="text-[10px] uppercase tracking-wide text-primary">{CATEGORIES.find((c) => c.id === l.category)?.label}</p>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">{l.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{l.name}, {l.age}{l.details.height ? ` · ${l.details.height}` : ""}</p>
          {l.details.hairColor && <p className="text-xs text-muted-foreground">{l.details.hairColor} hair</p>}
          <div className="mt-1 flex items-start gap-1 text-[11px] leading-tight text-muted-foreground">
            <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0" />
            <span className="min-w-0 break-words">
              {l.area && <span className="block">{l.area}</span>}
              <span className="block">{l.city}{l.state ? `, ${l.state}` : ""}</span>
            </span>
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-primary/40 p-5 shadow-glow sm:p-6">
          <DialogTitle className="sr-only">{l.title}</DialogTitle>
          <div className="grid gap-6 md:grid-cols-2">
            <PhotoGallery l={l} />
            <div>
              <ListingInfo l={l} />
              <Link to="/listings/$id" params={{ id: l.id }} className="mt-3 block text-center text-sm text-muted-foreground underline-offset-4 hover:underline">Open full page</Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
