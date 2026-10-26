// Server-only helpers for shared ads (publishable key only — works on self-hosted servers).
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Listing } from "@/lib/listings";

export function adsDb(bearer?: string) {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      ...(bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : {}),
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

type Row = { id: string; data: unknown; posted_at: string; expires_at: string; boost_until: string | null };
type Stored = Omit<Listing, "id" | "status" | "postedAt" | "expiresAt" | "featuredUntil">;

/** Turns stored rows into listings, swapping file paths for viewable links. */
export async function rowsToListings(db: ReturnType<typeof adsDb>, rows: Row[]): Promise<Listing[]> {
  const paths = new Set<string>();
  for (const r of rows) {
    const d = r.data as Stored;
    [d.img, ...(d.photos ?? []), d.video].forEach((p) => p && paths.add(p));
  }
  const links = new Map<string, string>();
  if (paths.size) {
    const { data } = await db.storage.from("ad-media").createSignedUrls([...paths], 7 * 24 * 3600);
    for (const s of data ?? []) if (s.path && s.signedUrl) links.set(s.path, s.signedUrl);
  }
  const link = (p?: string) => (p ? links.get(p) : undefined);
  return rows.flatMap((r) => {
    const d = r.data as Stored;
    const img = link(d.img);
    if (!img) return [];
    const video = link(d.video);
    const l: Listing = {
      ...d, id: r.id, img, photos: (d.photos ?? []).map(link).filter((x): x is string => !!x),
      status: "published", postedAt: r.posted_at, expiresAt: r.expires_at,
      ...(r.boost_until ? { featuredUntil: r.boost_until } : {}),
    };
    if (video) l.video = video; else delete l.video;
    return [l];
  });
}
