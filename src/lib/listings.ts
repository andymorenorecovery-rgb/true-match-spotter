import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";

export type Category = "dating" | "friendship" | "activity-partners";
export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "dating", label: "Dating" },
  { id: "friendship", label: "Friendship" },
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

export const DETAIL_FIELDS: { key: keyof Details; label: string; options?: string[] }[] = [
  { key: "gender", label: "Gender", options: ["Woman", "Man", "Non-binary", "Other"] },
  { key: "height", label: "Height", options: Array.from({ length: 31 }, (_, i) => `${Math.floor((56 + i) / 12)}'${(56 + i) % 12}"`) },
  { key: "hairColor", label: "Hair color", options: ["Black", "Brown", "Blonde", "Red", "Gray", "Bald", "Other"] },
  { key: "eyeColor", label: "Eye color", options: ["Brown", "Blue", "Green", "Hazel", "Gray", "Other"] },
  { key: "bodyType", label: "Body type", options: ["Slim", "Athletic", "Average", "Curvy", "Muscular", "Plus-size"] },
  { key: "ethnicity", label: "Ethnicity" },
  { key: "languages", label: "Languages" },
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
  details: Details;
  /** Shown only when the poster chose to share it. */
  phone?: string;
  status: "published" | "draft" | "expired" | "suspended";
  postedAt: string;
  expiresAt: string;
  featuredUntil?: string;
};

const DAY = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

export const formatLocation = (l: Pick<Listing, "area" | "city" | "state">) =>
  [l.area, [l.city, l.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ");

// Sample ads shown until accounts and posting are connected.
export const SAMPLE_LISTINGS: Listing[] = [
  { id: "1", title: "Rooftop sunsets & vinyl nights", name: "Sofia", age: 28, city: "Los Angeles", state: "CA", area: "Silver Lake", category: "dating", body: "Looking for someone to split dessert with and argue about the best record of the 70s. Terrible puns encouraged.", img: p1, details: { gender: "Woman", height: `5'6"`, hairColor: "Brown", eyeColor: "Brown", bodyType: "Slim", languages: "English, Spanish", lookingFor: "Men" }, phone: "(213) 555-0142", status: "published", postedAt: iso(-1), expiresAt: iso(29), featuredUntil: iso(5) },
  { id: "2", title: "Weekend cycling buddy wanted", name: "Daniel", age: 32, city: "Los Angeles", state: "CA", area: "Santa Monica", category: "activity-partners", body: "Easy 40-mile coastal rides on Saturdays, coffee after. All paces welcome.", img: p2, details: { gender: "Man", height: `6'0"`, hairColor: "Black", eyeColor: "Brown", bodyType: "Athletic", lookingFor: "Anyone" }, status: "published", postedAt: iso(-2), expiresAt: iso(28) },
  { id: "3", title: "Trail walks and dog parks", name: "Hannah", age: 35, city: "San Diego", state: "CA", area: "North Park", category: "friendship", body: "New in town with a very friendly retriever. Would love hiking friends.", img: p3, details: { gender: "Woman", height: `5'8"`, hairColor: "Blonde", eyeColor: "Blue", bodyType: "Athletic", lookingFor: "Anyone" }, status: "published", postedAt: iso(-3), expiresAt: iso(27), featuredUntil: iso(2) },
  { id: "4", title: "Dumpling hunter seeks partner in crime", name: "Marcus", age: 29, city: "Los Angeles", state: "CA", area: "Downtown", category: "dating", body: "Let's find the best street food in the city, one plate at a time.", img: p4, details: { gender: "Man", height: `5'11"`, hairColor: "Black", eyeColor: "Hazel", bodyType: "Average", lookingFor: "Women" }, status: "published", postedAt: iso(-4), expiresAt: iso(26) },
  { id: "5", title: "Old ad", name: "Test", age: 40, city: "Los Angeles", state: "CA", area: "Downtown", category: "dating", body: "Expired.", img: p2, details: {}, status: "published", postedAt: iso(-40), expiresAt: iso(-10) },
];

export const isFeatured = (l: Listing, now = Date.now()) =>
  !!l.featuredUntil && new Date(l.featuredUntil).getTime() > now;

export const isPubliclyVisible = (l: Listing, now = Date.now()) =>
  l.status === "published" && new Date(l.expiresAt).getTime() > now;

/** Featured first, rotated by a seed so no single ad always holds the top slot; then newest. */
export function rankListings(list: Listing[], now = Date.now(), seed = Math.floor(now / 3600000)) {
  const visible = list.filter((l) => isPubliclyVisible(l, now));
  const featured = visible.filter((l) => isFeatured(l, now)).sort((a, b) => a.id.localeCompare(b.id));
  const shift = featured.length ? seed % featured.length : 0;
  const rotated = [...featured.slice(shift), ...featured.slice(0, shift)];
  const regular = visible
    .filter((l) => !isFeatured(l, now))
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  return [...rotated, ...regular];
}
