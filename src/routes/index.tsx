import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { CATEGORIES, SAMPLE_LISTINGS, isFeatured, rankListings, type Category } from "@/lib/listings";
import { PRICING, formatPrice } from "@/lib/pricing";
import { US_CITIES, US_STATES } from "@/data/us-locations";
import { useLocalAds } from "@/lib/local-ads";
import { listPublicAds } from "@/utils/ads.functions";
import { syncUnsharedAds } from "@/lib/ad-sync";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ready Too Mingle — Local personal ads" },
      { name: "description", content: "Browse local personal ads for hookups, dating and casual encounters, or post your own." },
      { property: "og:title", content: "Ready Too Mingle — Local personal ads" },
      { property: "og:description", content: "Browse local personal ads for hookups, dating and casual encounters, or post your own." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  // Everyone's live ads come from the server, so every phone sees the same list.
  loader: () => listPublicAds(),
  component: Home,
});

const PAGE = 9;

function Home() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [cat, setCat] = useState<Category | "">("");
  const [sort, setSort] = useState<"featured" | "newest">("featured");
  const [shown, setShown] = useState(PAGE);
  const [seeking, setSeeking] = useState<"" | "Woman" | "Man">("");

  const serverAds = Route.useLoaderData();
  const localAds = useLocalAds();
  // Ads posted from this phone that aren't shared yet (older ads, a failed try) get shared now.
  useEffect(() => { syncUnsharedAds(); }, []);
  const cities = useMemo(() => {
    if (state) return [...(US_CITIES[state] ?? [])];
    return [...new Set(SAMPLE_LISTINGS.map((l) => l.city))].sort();
  }, [state]);
  const results = useMemo(() => {
    const onServer = new Set(serverAds.map((a) => a.id));
    let r = rankListings([...serverAds, ...localAds.filter((a) => !onServer.has(a.id)), ...SAMPLE_LISTINGS]);
    // Boosted ads stay on top whichever sort is picked; only the rest reshuffles.
    if (sort === "newest") {
      const boosted = r.filter((l) => isFeatured(l));
      const rest = r.filter((l) => !isFeatured(l)).sort((a, b) => b.postedAt.localeCompare(a.postedAt));
      r = [...boosted, ...rest];
    }
    const term = q.trim().toLowerCase();
    return r.filter(
      (l) =>
        (!state || l.state === state) &&
        (!city || l.city === city) &&
        (!cat || l.category === cat) &&
        (!seeking || l.details?.gender === seeking) &&
        (!term || `${l.title} ${l.body} ${l.area}`.toLowerCase().includes(term)),
    );
  }, [q, state, city, cat, sort, seeking, localAds, serverAds]);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 text-center">
        <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
          Meet people <span className="text-shine text-shine-slow italic">near you</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Local personal ads for hookups, dating and finding someone to share the same interests with. Find your eye candy.
        </p>
        <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-8 flex max-w-2xl flex-col gap-2 rounded-2xl border bg-card p-2 sm:flex-row">
          <select
            value={state}
            onChange={(e) => { setState(e.target.value); setCity(""); setShown(PAGE); }}
            aria-label="State"
            className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none"
          >
            <option value="">All states</option>
            {US_STATES.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setShown(PAGE); }}
            aria-label="City"
            disabled={!state}
            className="rounded-xl bg-secondary px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">{state ? "All cities" : "Pick a state first"}</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
          <div className="flex flex-1 items-center gap-2 px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search interests, areas…" className="w-full bg-transparent py-3 text-sm outline-none" />
          </div>
        </form>
        <Link to="/post" className="mt-6 inline-block rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow">
          Post an ad — from {formatPrice(PRICING.dayAd.priceCents)}
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-muted-foreground">Show me:</span>
          <Chip active={!seeking} onClick={() => { setSeeking(""); setShown(PAGE); }}>Everyone</Chip>
          <Chip active={seeking === "Woman"} onClick={() => { setSeeking("Woman"); setShown(PAGE); }}>Women</Chip>
          <Chip active={seeking === "Man"} onClick={() => { setSeeking("Man"); setShown(PAGE); }}>Men</Chip>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Chip active={!cat} onClick={() => setCat("")}>All</Chip>
          {CATEGORIES.map((c) => <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.label}</Chip>)}
          <select value={sort} onChange={(e) => setSort(e.target.value as "featured" | "newest")} aria-label="Sort" className="ml-auto rounded-full border bg-card px-4 py-2 text-sm">
            <option value="featured">Boosted first</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        {results.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
