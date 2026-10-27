import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { ListingInfo, PhotoGallery } from "@/components/ListingDetails";
import { SAMPLE_LISTINGS, isPubliclyVisible, type Listing } from "@/lib/listings";
import { useLocalAds } from "@/lib/local-ads";
import { getPublicAd } from "@/utils/ads.functions";
import { takeAdFlash } from "@/lib/ad-flash";

export const Route = createFileRoute("/listings/$id")({
  // Shared ads load from the server so anyone can open them; an ad that isn't
  // shared yet can still be opened on the phone it was posted from (below).
  loader: async ({ params }) => {
    const l = SAMPLE_LISTINGS.find((x) => x.id === params.id);
    if (l) return isPubliclyVisible(l) ? l : null;
    return getPublicAd({ data: { id: params.id } });
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
  // "Your ad has been reposted" / "Your ad is live" — set just before landing here.
  const flash = useRouterState({ select: (s) => s.location.state.adFlash ?? "" });
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {flash && (
        <p role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-like/40 bg-secondary px-4 py-3 text-sm font-semibold text-like">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash}
        </p>
      )}
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
  const l = ads.find((a) => a.id === id && !a.removed);
  if (!l) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-bold">{ready ? "This ad isn't available" : "Loading…"}</h1>
        {ready && (
          <>
            <p className="mt-2 text-muted-foreground">
              It may have ended or been removed.
            </p>
          </>
        )}
        <Link to="/" className="mt-6 inline-block text-primary">Browse ads</Link>
      </div>
    );
  }
  return <AdView l={l} />;
}
