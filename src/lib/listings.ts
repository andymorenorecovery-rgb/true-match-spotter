import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p1b from "@/assets/p1b.jpg";
import p1c from "@/assets/p1c.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import g7 from "@/assets/g7.jpg";
import g8 from "@/assets/g8.jpg";
import g9 from "@/assets/g9.jpg";
import g10 from "@/assets/g10.jpg";
import g11 from "@/assets/g11.jpg";
import g12 from "@/assets/g12.jpg";
import g13 from "@/assets/g13.jpg";
import g14 from "@/assets/g14.jpg";
import g15 from "@/assets/g15.jpg";
import g16 from "@/assets/g16.jpg";
import g16b from "@/assets/g16b.jpg";
import g16c from "@/assets/g16c.jpg";
import g17 from "@/assets/g17.jpg";
import g18 from "@/assets/g18.jpg";
import g19 from "@/assets/g19.jpg";
import g20 from "@/assets/g20.jpg";
import g1b from "@/assets/g1b.jpg";
import g1c from "@/assets/g1c.jpg";
import g2b from "@/assets/g2b.jpg";
import g2c from "@/assets/g2c.jpg";
import g3b from "@/assets/g3b.jpg";
import g3c from "@/assets/g3c.jpg";
import g4b from "@/assets/g4b.jpg";
import g4c from "@/assets/g4c.jpg";
import g5b from "@/assets/g5b.jpg";
import g5c from "@/assets/g5c.jpg";
import g6b from "@/assets/g6b.jpg";
import g6c from "@/assets/g6c.jpg";
import g7b from "@/assets/g7b.jpg";
import g7c from "@/assets/g7c.jpg";
import g8b from "@/assets/g8b.jpg";
import g8c from "@/assets/g8c.jpg";
import g9b from "@/assets/g9b.jpg";
import g9c from "@/assets/g9c.jpg";
import g10b from "@/assets/g10b.jpg";
import g10c from "@/assets/g10c.jpg";
import g11b from "@/assets/g11b.jpg";
import g11c from "@/assets/g11c.jpg";
import g12b from "@/assets/g12b.jpg";
import g12c from "@/assets/g12c.jpg";
import g13b from "@/assets/g13b.jpg";
import g13c from "@/assets/g13c.jpg";
import g14b from "@/assets/g14b.jpg";
import g14c from "@/assets/g14c.jpg";
import g15b from "@/assets/g15b.jpg";
import g15c from "@/assets/g15c.jpg";
import g17b from "@/assets/g17b.jpg";
import g17c from "@/assets/g17c.jpg";
import g18b from "@/assets/g18b.jpg";
import g18c from "@/assets/g18c.jpg";
import g19b from "@/assets/g19b.jpg";
import g19c from "@/assets/g19c.jpg";
import g20b from "@/assets/g20b.jpg";
import g20c from "@/assets/g20c.jpg";

export type Category = "dating" | "friendship" | "hookups" | "activity-partners";
export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "dating", label: "Dating" },
  { id: "friendship", label: "Friendship" },
  { id: "hookups", label: "Hookups" },
  { id: "activity-partners", label: "Activity partners" },
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
  plan?: "day" | "week";
};

/** Demo ads are pinned in time on purpose. Reading the real clock here made the
 * server-rendered page disagree with the browser, so the delivered front page
 * came out empty and React threw a hydration error. */
const FOREVER = "2030-01-01T00:00:00.000Z";
const EXPIRED = "2000-01-01T00:00:00.000Z";
const BOOST_LATEST = "2029-12-05T00:00:00.000Z";

export const formatLocation = (l: Pick<Listing, "area" | "city" | "state">) =>
  [l.area, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

// Sample ads shown until accounts and posting are connected.
export const SAMPLE_LISTINGS: Listing[] = [
  { id: "1", title: "Rooftop sunsets & vinyl nights", name: "Sofia", age: 28, city: "Los Angeles", state: "CA", area: "Silver Lake", category: "dating", body: "Looking for someone to split dessert with and argue about the best record of the 70s. Terrible puns encouraged.", img: p1, photos: [p1b, p1c], details: { gender: "Woman", height: `5'6"`, hairColor: "Brown", eyeColor: "Brown", bodyType: "Slim", languages: "English, Spanish", lookingFor: "Men" }, phone: "(213) 555-0142", status: "published", postedAt: "2026-08-31T00:00:00.000Z", expiresAt: FOREVER, featuredUntil: BOOST_LATEST },
  { id: "g14", title: "Brunch queen looking for a king", name: "Amara", age: 27, city: "Nashville", state: "TN", area: "East Nashville", category: "dating", body: "Mimosas, live country music and good company. Looking for someone fun, honest and adventurous.", img: g14, photos: [g14b, g14c], details: { gender: "Woman", height: "5'6\"", hairColor: "Brown", eyeColor: "Brown", bodyType: "Curvy", ethnicity: "Mixed", languages: "English", lookingFor: "Men" }, phone: "(615) 555-0123", status: "published", postedAt: "2026-08-16T00:00:00.000Z", expiresAt: FOREVER, plan: "day" },
  { id: "g16", title: "Let's dance the night away", name: "Isabella", age: 26, city: "Orlando", state: "FL", area: "Downtown", category: "hookups", body: "Outgoing, fun and always ready to hit the dance floor. Looking for good vibes and no drama. 18+ only.", img: g16, photos: [g16b, g16c], details: { gender: "Woman", height: "5'4\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Curvy", ethnicity: "Hispanic / Latino", languages: "English, Spanish", lookingFor: "Men" }, phone: "(407) 555-0119", status: "published", postedAt: "2026-08-14T00:00:00.000Z", expiresAt: FOREVER },
  { id: "5", title: "Old ad", name: "Test", age: 40, city: "Los Angeles", state: "CA", area: "Downtown", category: "dating", body: "Expired.", img: p2, details: {}, status: "published", postedAt: "2025-12-01T00:00:00.000Z", expiresAt: EXPIRED },
];

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
