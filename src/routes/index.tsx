import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES, SAMPLE_LISTINGS, rankListings, type Category } from "@/lib/listings";
import { PRICING, formatPrice } from "@/lib/pricing";
import { US_CITIES, US_STATES } from "@/data/us-locations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ready Too Mingle — Local personal ads" },
      { name: "description", content: "Browse local personal ads for dating, friendship and activity partners, or post your own." },
      { property: "og:title", content: "Ready Too Mingle — Local personal ads" },
      { property: "og:description", content: "Browse local personal ads for dating, friendship and activity partners, or post your own." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PAGE = 8;

function Home() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState<Category | "">("");
  const [sort, setSort] = useState<"featured" | "newest">("featured");
  const [shown, setShown] = useState(PAGE);

  const cities = useMemo(() => {
    if (state) return [...(US_CITIES[state] ?? [])];
    return [...new Set(SAMPLE_LISTINGS.map((l) => l.city))].sort();
  }, [state]);
  const results = useMemo(() => {
    let r = rankListings(SAMPLE_LISTINGS);
    if (sort === "newest") r = [...r].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
    const term = q.trim().toLowerCase();
    return r.filter(
      (l) =>
        (!state || l.state === state) &&
        (!city || l.city === city) &&
        (!cat || l.category === cat) &&
        (!term || `${l.title} ${l.body} ${l.area}`.toLowerCase().includes(term)),
    );
  }, [q, state, city, cat, sort]);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
          Meet people <span className="text-gradient italic">near you</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Local personal ads for dating, friendship and finding someone to share your hobbies with.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border bg-card p-2 sm:flex-row">
          <select value={city} onChange={(e) => { setCity(e.target.value); setShown(PAGE); }} aria-label="City" className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none">
            <option value="">All cities</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search interests, areas…" className="w-full bg-transparent py-3 text-sm outline-none" />
          </div>
        </form>
        <Link to="/post" className="mt-6 inline-block rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow">
          Post an ad — {formatPrice(PRICING.standardAd.priceCents)}
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Chip active={!cat} onClick={() => setCat("")}>All</Chip>
          {CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>)}
          <select value={sort} onChange={(e) => setSort(e.target.value as "featured" | "newest")} aria-label="Sort" className="ml-auto rounded-full border bg-card px-4 py-2 text-sm">
            <option value="featured">Featured first</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        {results.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.slice(0, shown).map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground">No ads match yet. Try another city or category.</p>
        )}
        {shown < results.length && (
          <div className="mt-8 text-center">
            <button onClick={() => setShown((s) => s + PAGE)} className="rounded-full border px-6 py-2 text-sm">Load more</button>
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm transition ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
      {children}
    </button>
  );
}
