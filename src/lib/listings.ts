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

export type Listing = {
  id: string;
  title: string;
  name: string;
  age: number;
  city: string;
  area: string;
  category: Category;
  body: string;
  img: string;
  status: "published" | "draft" | "expired" | "suspended";
  postedAt: string;
  expiresAt: string;
  featuredUntil?: string;
};

const DAY = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString();

// Sample ads shown until accounts and posting are connected.
export const SAMPLE_LISTINGS: Listing[] = [
  { id: "1", title: "Rooftop sunsets & vinyl nights", name: "Sofia", age: 28, city: "Los Angeles", area: "Silver Lake", category: "dating", body: "Looking for someone to split dessert with and argue about the best record of the 70s. Terrible puns encouraged.", img: p1, status: "published", postedAt: iso(-1), expiresAt: iso(29), featuredUntil: iso(5) },
  { id: "2", title: "Weekend cycling buddy wanted", name: "Daniel", age: 32, city: "Los Angeles", area: "Santa Monica", category: "activity-partners", body: "Easy 40-mile coastal rides on Saturdays, coffee after. All paces welcome.", img: p2, status: "published", postedAt: iso(-2), expiresAt: iso(28) },
  { id: "3", title: "Trail walks and dog parks", name: "Hannah", age: 35, city: "San Diego", area: "North Park", category: "friendship", body: "New in town with a very friendly retriever. Would love hiking friends.", img: p3, status: "published", postedAt: iso(-3), expiresAt: iso(27), featuredUntil: iso(2) },
  { id: "4", title: "Dumpling hunter seeks partner in crime", name: "Marcus", age: 29, city: "San Francisco", area: "Mission", category: "dating", body: "Let's find the best street food in the city, one plate at a time.", img: p4, status: "published", postedAt: iso(-4), expiresAt: iso(26) },
  { id: "5", title: "Old ad", name: "Test", age: 40, city: "Los Angeles", area: "Downtown", category: "dating", body: "Expired.", img: p2, status: "published", postedAt: iso(-40), expiresAt: iso(-10) },
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
