import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Gift } from "lucide-react";
import { getAccount } from "@/utils/account.functions";
import { accountQueryKey, NotificationList } from "@/components/NotificationBell";
import { supabase } from "@/integrations/supabase/client";
import { REFERRAL } from "@/lib/pricing";
import { useLocalAds } from "@/lib/local-ads";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My account — Ready Too Mingle" },
      { name: "description", content: "Your ads, invite rewards and reminders on Ready Too Mingle." },
      { property: "og:title", content: "My account — Ready Too Mingle" },
      { property: "og:description", content: "Your ads, invite rewards and reminders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const { data, isLoading, error } = useQuery({ queryKey: accountQueryKey, queryFn: () => getAccount() });
  const [copied, setCopied] = useState(false);
  // Ads posted on this device (full content) plus any ads only known to the server.
  // Hooks stay above the early returns so their order never changes.
  const deviceAds = useLocalAds();
  if (error) return <p className="px-4 py-20 text-center text-muted-foreground">We couldn't load your account. Please refresh, or sign in again.</p>;
  if (isLoading || !data) return <p className="px-4 py-20 text-center text-muted-foreground">Loading…</p>;
  const link = data.profile ? `${window.location.origin}/?ref=${data.profile.referral_code}` : "";
  const credits = data.profile?.free_week_credits ?? 0;
  const now = Date.now();
  const onDevice = new Set(deviceAds.map((a) => a.id));
  const serverOnly = data.ads.filter((a) => !onDevice.has(a.ad_id));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold">My account</h1>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.replace("/"))} className="rounded-full border border-primary px-4 py-1.5 text-sm font-semibold text-primary hover:bg-secondary">Sign out</button>
      </div>

      <section className="rounded-2xl border border-primary bg-card p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold"><Gift className="h-5 w-5 text-primary" /> Bring a friend, get a free week</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Share your link. When a friend signs up with it and pays for their first ad, you get {REFERRAL.freeWeeksPerFriend} free 1-week ad.
        </p>
        <div className="mt-4 flex gap-2">
          <input readOnly value={link} className="min-w-0 flex-1 rounded-xl border bg-background px-3 py-2 text-sm" />
          <button onClick={() => navigator.clipboard.writeText(link).then(() => setCopied(true))} className="flex items-center gap-1 rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-4 text-sm">Free week ads available: <span className="font-bold text-primary">{credits}</span>
          {credits > 0 && <> · <Link to="/post" className="underline">Use one now</Link></>}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Notifications</h2>
        <NotificationList notes={data.notifications} />
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">My ads</h2>
        {!deviceAds.length && !serverOnly.length ? <p className="text-sm text-muted-foreground">No ads yet. <Link to="/post" className="underline">Post your first ad</Link></p> : (
          <ul className="space-y-2">
            {deviceAds.map((a) => {
              const live = Date.parse(a.expiresAt) > now;
              const boosted = !!a.featuredUntil && Date.parse(a.featuredUntil) > now;
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm">
                  <div>
                    <p className="font-medium">{a.title || "My ad"}</p>
                    <p className="text-xs text-muted-foreground">
                      {live ? `Live — ends ${new Date(a.expiresAt).toLocaleString()}` : "Ended"}{boosted ? " · Boosted" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {live && <Link to="/listings/$id" params={{ id: a.id }} className="rounded-full bg-secondary px-3 py-1.5 text-xs">View</Link>}
                    {live && <Link to="/post" search={{ edit: a.id }} className="rounded-full bg-secondary px-3 py-1.5 text-xs">Edit</Link>}
                    {!live && <Link to="/post" className="rounded-full bg-secondary px-3 py-1.5 text-xs">Post again</Link>}
                  </div>
                </li>
              );
            })}
            {serverOnly.map((a) => {
              const live = Date.parse(a.expires_at) > now;
              const boosted = a.boost_until && Date.parse(a.boost_until) > now;
              return (
                <li key={a.ad_id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm">
                  <div>
                    <p className="font-medium">{a.title || "My ad"}</p>
                    <p className="text-xs text-muted-foreground">
                      {live ? `Ends ${new Date(a.expires_at).toLocaleString()}` : "Ended"}{boosted ? " · Boosted" : ""}
                    </p>
                  </div>
                  {live
                    ? <Link to="/listings/$id" params={{ id: a.ad_id }} className="rounded-full bg-secondary px-3 py-1.5 text-xs">{boosted ? "View" : "Boost again"}</Link>
                    : <Link to="/post" className="rounded-full bg-secondary px-3 py-1.5 text-xs">Repost</Link>}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">Ads are saved on the phone or browser you posted them from — open your account there to view, edit or boost them.</p>
      </section>
    </div>
  );
}
