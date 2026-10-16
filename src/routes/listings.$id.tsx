import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ListingInfo, PhotoGallery } from "@/components/ListingDetails";
import { SAMPLE_LISTINGS, isPubliclyVisible } from "@/lib/listings";

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
        <PhotoGallery l={l} />
        <ListingInfo l={l} />
      </div>
    </div>
  );
}
