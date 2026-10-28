import { createFileRoute, Link } from "@tanstack/react-router";
import { CITY_PAGES } from "@/lib/cities";

const TITLE = "Personals by City — Local Hookups & Dating Ads | Ready Too Mingle";
const DESC = "Find local personal ads in your city: New York, Los Angeles, Chicago, Houston, Miami and more. A Craigslist personals alternative for adults 18+.";

export const Route = createFileRoute("/personals/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://readytoomingle.com/personals" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://readytoomingle.com/personals" }],
  }),
  component: Cities,
});

function Cities() {
  const sorted = [...CITY_PAGES].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-12">
      <h1 className="text-center text-4xl font-bold">Personals by city</h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
        Pick your city to see local ads for hookups, quick dates and dating. Ads from every US city also show on the home page.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sorted.map((p) => (
          <Link key={p.slug} to="/personals/$city" params={{ city: p.slug }} className="rounded-xl border bg-card px-4 py-3 text-sm hover:border-primary/50">
            {p.name} <span className="text-muted-foreground">· {p.state}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
