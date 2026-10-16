import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Images, MapPin, Star } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ListingInfo, PhotoGallery } from "@/components/ListingDetails";
import { CATEGORIES, formatLocation, getPhotos, isFeatured, type Listing } from "@/lib/listings";

export function ListingCard({ l }: { l: Listing }) {
  const [open, setOpen] = useState(false);
  const featured = isFeatured(l);
  const count = getPhotos(l).length;
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`group block w-full overflow-hidden rounded-2xl border bg-card text-left transition hover:-translate-y-0.5 ${featured ? "border-boost shadow-boost" : ""}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={l.img} alt={l.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
          {featured && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-boost px-3 py-1 text-xs font-semibold text-background">
              <Star className="h-3 w-3 fill-current" /> Boosted
            </span>
          )}
          {count > 1 && <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-overlay/70 px-2 py-1 text-xs"><Images className="h-3 w-3" />{count}</span>}
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-wide text-primary">{CATEGORIES.find((c) => c.id === l.category)?.label}</p>
          <h3 className="mt-1 text-lg font-semibold leading-snug">{l.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{l.name}, {l.age}{l.details.height ? ` · ${l.details.height}` : ""}{l.details.hairColor ? ` · ${l.details.hairColor} hair` : ""}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{formatLocation(l)}</p>
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
