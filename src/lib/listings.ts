
export type Category = "hookups" | "quick-dates" | "dating" | "eye-candy" | "generous-dates";
export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "hookups", label: "Hookups" },
  { id: "quick-dates", label: "Quick Dates" },
  { id: "dating", label: "Dating" },
  { id: "eye-candy", label: "Eye Candy" },
  { id: "generous-dates", label: "Generous Dates" },
];

export type Details = {
  gender?: string;
  height?: string;
  hairColor?: string;
  eyeColor?: string;
  bodyType?: string;
  ethnicity?: string;
  languages?: string;
  lookingFor?: string;
};

export const DETAIL_FIELDS: { key: keyof Details; label: string; options: string[]; multi?: boolean }[] = [
  { key: "gender", label: "Gender", options: ["Woman", "Man", "Non-binary", "Other"] },
  { key: "height", label: "Height", options: Array.from({ length: 31 }, (_, i) => `${Math.floor((56 + i) / 12)}'${(56 + i) % 12}"`) },
  { key: "hairColor", label: "Hair color", options: ["Black", "Brown", "Blonde", "Red", "Gray", "Bald", "Other"] },
  { key: "eyeColor", label: "Eye color", options: ["Brown", "Blue", "Green", "Hazel", "Gray", "Other"] },
  { key: "bodyType", label: "Body type", options: ["Slim", "Athletic", "Average", "Curvy", "Muscular", "Plus-size"] },
  { key: "ethnicity", label: "Ethnicity", options: ["Hispanic / Latino", "White", "Black / African American", "Asian", "Middle Eastern", "Native American", "Pacific Islander", "Mixed", "Other"] },
  { key: "languages", label: "Languages", multi: true, options: ["English", "Spanish", "Chinese", "Tagalog", "Vietnamese", "Arabic", "French", "Korean", "Russian", "Portuguese", "Hindi", "Other"] },
  { key: "lookingFor", label: "Looking for", options: ["Women", "Men", "Anyone"] },
];

export type Listing = {
  id: string;
  title: string;
  name: string;
  age: number;
  city: string;
  state: string;
  area: string;
  category: Category;
  body: string;
  img: string;
  /** Extra photos after the main one. */
  photos?: string[];
  details: Details;
  /** Shown only when the poster chose to share it. */
  phone?: string;
  status: "published" | "draft" | "expired" | "suspended";
  postedAt: string;
  expiresAt: string;
  featuredUntil?: string;
  /** Which paid plan posted the ad: day ads get a purple frame. */
  plan?: "day" | "week" | "month";
  /** Web address of the selfie video (ads shared from the server). */
  video?: string;
  /** Owner's copy only: true once this version is saved on the server for everyone. */
  synced?: boolean;
  /** Free giveaway ad posted without an account (owner device only). */
  giveaway?: boolean;
  /** Owner took it down; kept on their phone so they can repost while the paid time lasts. */
  removed?: boolean;
  /** Owner's copy only: where the photos/video were uploaded (sig = which photos). */
  remote?: { sig: string; img: string; photos: string[]; video?: string };
};

/** Demo ads are pinned in time on purpose. Reading the real clock here made the
 * server-rendered page disagree with the browser, so the delivered front page
 * came out empty and React threw a hydration error. */
const EXPIRED = "2000-01-01T00:00:00.000Z";


export const formatLocation = (l: Pick<Listing, "area" | "city" | "state">) =>
  [l.area, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

// Sample ads (none — only real members' ads are shown).
export const SAMPLE_LISTINGS: Listing[] = [];

export const isFeatured = (l: Listing, now = Date.now()) =>
  !!l.featuredUntil && new Date(l.featuredUntil).getTime() > now;

export const isPubliclyVisible = (l: Listing, now = Date.now()) =>
  l.status === "published" && new Date(l.expiresAt).getTime() > now;

/** Green = boosted right now; purple = a 24-hour ad that isn't boosted. */
export const glowOf = (l: Listing, now = Date.now()): "boost" | "day" | null =>
  isFeatured(l, now) ? "boost" : l.plan === "day" ? "day" : null;

/** Boosted ads are always on top, most recently boosted first (newer boosts push older ones down); everyone else follows, newest first. */
export function rankListings(list: Listing[], now = Date.now()) {
  const visible = list.filter((l) => isPubliclyVisible(l, now));
  const byNewest = (a: Listing, b: Listing) => b.postedAt.localeCompare(a.postedAt);
  const byLatestBoost = (a: Listing, b: Listing) => b.featuredUntil!.localeCompare(a.featuredUntil!);
  const boosted = visible.filter((l) => isFeatured(l, now)).sort(byLatestBoost);
  const regular = visible.filter((l) => !isFeatured(l, now)).sort(byNewest);
  return [...boosted, ...regular];
}

export const getPhotos = (l: Pick<Listing, "img" | "photos">) => [l.img, ...(l.photos ?? [])];
