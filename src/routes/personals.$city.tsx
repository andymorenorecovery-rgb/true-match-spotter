import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ListingCard } from "@/components/ListingCard";
import { rankListings } from "@/lib/listings";
import { PRICING, formatPrice } from "@/lib/pricing";
import { CITY_PAGES, findCityPage, inCity } from "@/lib/cities";
import { listPublicAds } from "@/utils/ads.functions";

export const Route = createFileRoute("/personals/$city")({
  loader: async ({ params }) => {
    const page = findCityPage(params.city);
    if (!page) throw notFound();
    const ads = await listPublicAds();
    return { page, ads: rankListings(ads.filter((a) => inCity(page, a))) };
  },
  head: ({ params, loaderData }) => {
    const url = `https://readytoomingle.com/personals/${params.city}`;
    if (!loaderData) return { meta: [{ title: "City not found — Ready Too Mingle" }, { name: "robots", content: "noindex" }] };
    const { name } = loaderData.page;
    const title = `${name} Personals — Hookups & Dating Ads | Ready Too Mingle`;
    const description = `Local ${name} personal ads for hookups, quick dates and dating. A Craigslist personals alternative — browse ${name} ads or post your own.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:image", content: "https://readytoomingle.com/share-card.jpg" },
        { name: "twitter:image", content: "https://readytoomingle.com/share-card.jpg" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">We don't have that city page yet</h1>
      <Link to="/personals" className="mt-6 inline-block underline">See all cities</Link>
    </div>
  ),
  component: CityPersonals,
});

function CityPersonals() {
  const { page, ads } = Route.useLoaderData();
  const nearby = CITY_PAGES.filter((p) => p.slug !== page.slug && p.state === page.state);
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-12">
      <h1 className="text-center text-4xl font-bold leading-tight sm:text-5xl">
        {page.name} <span className="text-shine text-shine-slow italic">personals</span>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        Local personal ads in {page.name}, {page.stateName} for hookups, quick dates and dating. Every member records a
        live video selfie, so you know who you're meeting is real. Adults 18+ only.
      </p>
      <div className="mt-6 text-center">
        <Link to="/post" className="inline-block rounded-full bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-glow">
          Post a {page.name} ad — from {formatPrice(PRICING.dayAd.priceCents)}
        </Link>
      </div>

      <section className="mt-10">
        {ads.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ads.map((l) => <ListingCard key={l.id} l={l} />)}
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="font-semibold">No {page.name} ads yet — be one of the first.</p>
            <p className="mt-2 text-sm text-muted-foreground">Make a free account and your ad shows here for everyone in {page.name}.</p>
          </div>
        )}
      </section>

      <section className="mt-14 space-y-3 text-sm text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">A Craigslist personals alternative for {page.name}</h2>
        <p>
          Since Craigslist closed its personals, people in {page.name} have been looking for a simple place to post a
          local ad. Ready Too Mingle keeps it simple: pick your category, add photos and a short video selfie, and your
          ad goes up for {page.name}. Boosted ads glow green and sit at the top.
        </p>
        <p>No nudity, no selling sex and no escorts — rule-breakers are removed.</p>
      </section>

      {nearby.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">More cities in {page.stateName}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {nearby.map((p) => (
              <Link key={p.slug} to="/personals/$city" params={{ city: p.slug }} className="rounded-full bg-secondary px-4 py-2 text-sm">{p.name}</Link>
            ))}
          </div>
        </section>
      )}
      <p className="mt-8 text-sm"><Link to="/personals" className="underline">All cities</Link></p>
    </div>
  );
}
