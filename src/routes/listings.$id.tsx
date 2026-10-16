import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Star } from "lucide-react";
import { CATEGORIES, SAMPLE_LISTINGS, isFeatured, isPubliclyVisible } from "@/lib/listings";

export const Route = createFileRoute("/listings/$id")({
  loader: ({ params }) => {
    const l = SAMPLE_LISTINGS.find((x) => x.id === params.id);
    if (!l || !isPubliclyVisible(l)) throw notFound();
    return l;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Ready Too Mingle` },
          { name: "description", content: loaderData.body.slice(0, 150) },
          { property: "og:title", content: `${loaderData.title} — Ready Too Mingle` },
          { property: "og:description", content: loaderData.body.slice(0, 150) },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Ad unavailable — Ready Too Mingle" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">This ad isn't available</h1>
      <p className="mt-2 text-muted-foreground">It may have expired or been removed.</p>
      <Link to="/" className="mt-6 inline-block text-primary">Browse ads</Link>
    </div>
  ),
  component: ListingPage,
});

function ListingPage() {
  const l = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> All ads</Link>
      <div className="grid gap-8 md:grid-cols-2">
        <img src={l.img} alt={l.title} className="aspect-[3/4] w-full rounded-3xl object-cover" />
        <div>
          {isFeatured(l) && <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-gradient-primary px-3 py-1 text-xs font-semibold text-primary-foreground"><Star className="h-3 w-3 fill-current" /> Featured · paid placement</span>}
          <p className="text-xs uppercase tracking-wide text-primary">{CATEGORIES.find((c) => c.id === l.category)?.label}</p>
          <h1 className="mt-1 text-3xl font-bold">{l.title}</h1>
          <p className="mt-2 text-muted-foreground">{l.name}, {l.age}</p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{formatLocation(l)}</p>
            <p className="flex items-center gap-2"><Calendar className="h-4 w-4" />Posted {new Date(l.postedAt).toLocaleDateString()}</p>
          </div>
          <p className="mt-6 leading-relaxed">{l.body}</p>
          <button disabled className="mt-8 w-full rounded-full bg-secondary py-3 font-semibold text-muted-foreground">
            Messaging arrives with accounts
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">Contact details are never shown publicly.</p>
        </div>
      </div>
    </div>
  );
}
