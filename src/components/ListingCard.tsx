import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { CATEGORIES, formatLocation, isFeatured, type Listing } from "@/lib/listings";

export function ListingCard({ l }: { l: Listing }) {
  const featured = isFeatured(l);
  return (
    <Link
      to="/listings/$id"
      params={{ id: l.id }}
      className={`group block overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 ${featured ? "border-primary shadow-glow" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={l.img} alt={l.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        {featured && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <Star className="h-3 w-3 fill-current" /> Featured
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-primary">{CATEGORIES.find((c) => c.id === l.category)?.label}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug">{l.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{l.name}, {l.age}{l.details.height ? ` · ${l.details.height}` : ""}{l.details.hairColor ? ` · ${l.details.hairColor} hair` : ""}</p>
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{formatLocation(l)}</p>
      </div>
    </Link>
  );
}
