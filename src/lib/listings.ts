import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p1b from "@/assets/p1b.jpg";
import p1c from "@/assets/p1c.jpg";
import p4b from "@/assets/p4b.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

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

const DAY = 86400000;
/** Demo ads are pinned in time on purpose. Reading the real clock here made the
 * server-rendered page disagree with the browser, so the delivered front page
 * came out empty and React threw a hydration error. */
const SAMPLE_BASE = Date.parse("2026-09-01T00:00:00Z");
const iso = (offsetDays: number) => new Date(SAMPLE_BASE + offsetDays * DAY).toISOString();
const FOREVER = "2030-01-01T00:00:00.000Z";
const EXPIRED = "2000-01-01T00:00:00.000Z";
const BOOST_LATEST = "2029-12-05T00:00:00.000Z";
const BOOST_MIDDLE = "2029-12-02T00:00:00.000Z";
const BOOST_OLDEST = "2029-12-01T00:00:00.000Z";

export const formatLocation = (l: Pick<Listing, "area" | "city" | "state">) =>
  [l.area, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

// Sample ads shown until accounts and posting are connected.
export const SAMPLE_LISTINGS: Listing[] = [
  { id: "1", title: "Rooftop sunsets & vinyl nights", name: "Sofia", age: 28, city: "Los Angeles", state: "CA", area: "Silver Lake", category: "dating", body: "Looking for someone to split dessert with and argue about the best record of the 70s. Terrible puns encouraged.", img: p1, photos: [p1b, p1c], details: { gender: "Woman", height: `5'6"`, hairColor: "Brown", eyeColor: "Brown", bodyType: "Slim", languages: "English, Spanish", lookingFor: "Men" }, phone: "(213) 555-0142", status: "published", postedAt: "2026-08-31T00:00:00.000Z", expiresAt: FOREVER, featuredUntil: BOOST_LATEST },
  { id: "2", title: "Weekend cycling buddy wanted", name: "Daniel", age: 32, city: "Los Angeles", state: "CA", area: "Santa Monica", category: "activity-partners", body: "Easy 40-mile coastal rides on Saturdays, coffee after. All paces welcome.", img: p2, details: { gender: "Man", height: `6'0"`, hairColor: "Black", eyeColor: "Brown", bodyType: "Athletic", lookingFor: "Anyone" }, status: "published", postedAt: "2026-08-30T00:00:00.000Z", expiresAt: FOREVER },
  { id: "3", title: "Trail walks and dog parks", name: "Hannah", age: 35, city: "San Diego", state: "CA", area: "North Park", category: "friendship", body: "New in town with a very friendly retriever. Would love hiking friends.", img: p3, details: { gender: "Woman", height: `5'8"`, hairColor: "Blonde", eyeColor: "Blue", bodyType: "Athletic", lookingFor: "Anyone" }, status: "published", postedAt: "2026-08-29T00:00:00.000Z", expiresAt: FOREVER, featuredUntil: BOOST_MIDDLE },
  { id: "4", title: "Dumpling hunter seeks partner in crime", name: "Marcus", age: 29, city: "Los Angeles", state: "CA", area: "Downtown", category: "dating", photos: [p4b], body: "Let's find the best street food in the city, one plate at a time.", img: p4, details: { gender: "Man", height: `5'11"`, hairColor: "Black", eyeColor: "Hazel", bodyType: "Average", lookingFor: "Women" }, status: "published", postedAt: "2026-08-28T00:00:00.000Z", expiresAt: FOREVER },
  { id: "6", title: "Gallery hopping & long walks", name: "Amara", age: 31, city: "Chicago", state: "IL", area: "Wicker Park", category: "friendship", body: "New to the neighborhood and looking for a walking-and-coffee buddy. I know all the good thrift stores.", img: p5, details: { gender: "Woman", height: `5'7"`, hairColor: "Black", eyeColor: "Brown", bodyType: "Average", languages: "English", lookingFor: "Anyone" }, status: "published", postedAt: "2026-08-27T00:00:00.000Z", expiresAt: FOREVER, featuredUntil: BOOST_OLDEST },
  { id: "7", title: "Sunrise hikes, then pancakes", name: "Jake", age: 27, city: "Denver", state: "CO", area: "Highlands", category: "activity-partners", body: "Looking for a regular hiking partner for the foothills. Beginners welcome, I bring the trail snacks.", img: p6, details: { gender: "Man", height: `6'1"`, hairColor: "Brown", eyeColor: "Green", bodyType: "Athletic", lookingFor: "Anyone" }, status: "published", postedAt: "2026-08-26T00:00:00.000Z", expiresAt: FOREVER, plan: "day" },
  { id: "8", title: "Not looking for anything serious", name: "Nina", age: 26, city: "Los Angeles", state: "CA", area: "Koreatown", category: "hookups", body: "Fun nights, good conversation, no pressure. Let's see if we click and take it from there.", img: p4b, details: { gender: "Woman", height: `5'5"`, hairColor: "Black", eyeColor: "Brown", bodyType: "Slim", languages: "English", lookingFor: "Men" }, status: "published", postedAt: "2026-08-30T00:00:00.000Z", expiresAt: FOREVER },
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
