import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ListingInfo, PhotoGallery } from "@/components/ListingDetails";
import { SAMPLE_LISTINGS, isPubliclyVisible, type Listing } from "@/lib/listings";
import { useLocalAds } from "@/lib/local-ads";

export const Route = createFileRoute("/listings/$id")({
  // Sample ads render on the server for search engines. A person's own ad only
  // exists on the device they posted it from, so it loads in the browser below.
  loader: ({ params }) => {
    const l = SAMPLE_LISTINGS.find((x) => x.id === params.id);
    return l && isPubliclyVisible(l) ? l : null;
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
  component: ListingPage,
});

function ListingPage() {
  const l = Route.useLoaderData();
  return l ? <AdView l={l} /> : <LocalAdPage />;
}

function AdView({ l }: { l: Listing }) {
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

/** An ad posted on this phone or computer: it lives in this browser only. */
function LocalAdPage() {
  const { id } = Route.useParams();
  const [ready, setReady] = useState(false);
  const ads = useLocalAds();
  useEffect(() => setReady(true), []);
  const l = ads.find((a) => a.id === id);
  if (!l) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">{ready ? "This ad isn't on this device" : "Loading…"}</h1>
        {ready && (
          <>
            <p className="mt-2 text-muted-foreground">
              Ads are saved on the phone or browser they were posted from, so this one can only be opened there.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Sign in on that device and open My account to view, edit or boost it.</p>
          </>
        )}
        <Link to="/" className="mt-6 inline-block text-primary">Browse ads</Link>
      </div>
    );
  }
  return <AdView l={l} />;
}
