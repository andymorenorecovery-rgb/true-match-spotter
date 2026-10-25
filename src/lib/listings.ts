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
  { id: "g1", title: "Sunset walks and good conversation", name: "Jasmine", age: 28, city: "Atlanta", state: "GA", area: "Midtown", category: "dating", body: "Coffee lover, sunset chaser and always down for a good taco spot. Looking for someone genuine who can make me laugh.", img: g1, photos: [g1b, g1c], details: { gender: "Woman", height: "5'5\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Slim", ethnicity: "Black / African American", languages: "English", lookingFor: "Men" }, phone: "(404) 555-0187", status: "published", postedAt: "2026-08-29T00:00:00.000Z", expiresAt: FOREVER, featuredUntil: "2029-12-04T00:00:00.000Z" },
  { id: "g2", title: "Coffee dates & cozy bookstores", name: "Min-ji", age: 26, city: "Los Angeles", state: "CA", area: "Koreatown", category: "dating", body: "New to the city and looking for someone to show me their favorite coffee shop. Bonus points if you like K-dramas.", img: g2, photos: [g2b, g2c], details: { gender: "Woman", height: "5'3\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Slim", ethnicity: "Asian", languages: "English, Korean", lookingFor: "Men" }, phone: "(213) 555-0129", status: "published", postedAt: "2026-08-28T00:00:00.000Z", expiresAt: FOREVER, featuredUntil: "2029-12-04T00:00:00.000Z" },
  { id: "g3", title: "Beach days and salsa nights", name: "Valeria", age: 31, city: "Miami", state: "FL", area: "Brickell", category: "dating", body: "I love the ocean, dancing and cooking for people I care about. Let's grab a cafecito and see where it goes.", img: g3, photos: [g3b, g3c], details: { gender: "Woman", height: "5'6\"", hairColor: "Brown", eyeColor: "Brown", bodyType: "Curvy", ethnicity: "Hispanic / Latino", languages: "English, Spanish", lookingFor: "Men" }, phone: "(305) 555-0163", status: "published", postedAt: "2026-08-27T00:00:00.000Z", expiresAt: FOREVER, featuredUntil: "2029-12-03T00:00:00.000Z" },
  { id: "g4", title: "Hiking buddy wanted", name: "Kelsey", age: 29, city: "Denver", state: "CO", area: "Highlands", category: "activity-partners", body: "Weekends are for trails. Looking for someone who can keep up on a 10-mile hike and wants brunch after.", img: g4, photos: [g4b, g4c], details: { gender: "Woman", height: "5'7\"", hairColor: "Blonde", eyeColor: "Blue", bodyType: "Athletic", ethnicity: "White", languages: "English", lookingFor: "Anyone" }, phone: "(303) 555-0118", status: "published", postedAt: "2026-08-26T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g5", title: "Rooftop drinks, real connection", name: "Priya", age: 27, city: "New York", state: "NY", area: "Upper East Side", category: "dating", body: "Work hard, laugh harder. I'm into live music, rooftop views and long talks about everything.", img: g5, photos: [g5b, g5c], details: { gender: "Woman", height: "5'4\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Slim", ethnicity: "Asian", languages: "English, Hindi", lookingFor: "Men" }, phone: "(212) 555-0194", status: "published", postedAt: "2026-08-25T00:00:00.000Z", expiresAt: FOREVER, plan: "day" },
  { id: "g6", title: "Art lover seeking a museum date", name: "Layla", age: 30, city: "Chicago", state: "IL", area: "West Loop", category: "dating", body: "Gallery openings, good wine and great conversation. Looking for someone curious and kind.", img: g6, photos: [g6b, g6c], details: { gender: "Woman", height: "5'6\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Average", ethnicity: "Middle Eastern", languages: "English, Arabic", lookingFor: "Men" }, phone: "(312) 555-0145", status: "published", postedAt: "2026-08-24T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g7", title: "Looking for new friends in town", name: "Molly", age: 25, city: "Portland", state: "OR", area: "Pearl District", category: "friendship", body: "Just moved here! Looking for girlfriends to explore farmers markets, thrift stores and trivia nights.", img: g7, photos: [g7b, g7c], details: { gender: "Woman", height: "5'5\"", hairColor: "Red", eyeColor: "Green", bodyType: "Slim", ethnicity: "White", languages: "English", lookingFor: "Women" }, phone: "(503) 555-0126", status: "published", postedAt: "2026-08-23T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g8", title: "Foodie looking for a partner in crime", name: "Angelica", age: 28, city: "San Diego", state: "CA", area: "North Park", category: "dating", body: "If you know a hidden-gem restaurant, we already have something to talk about. Family-oriented and easygoing.", img: g8, photos: [g8b, g8c], details: { gender: "Woman", height: "5'2\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Average", ethnicity: "Asian", languages: "English, Tagalog", lookingFor: "Men" }, phone: "(619) 555-0138", status: "published", postedAt: "2026-08-22T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g9", title: "Grown, focused and ready to mingle", name: "Danielle", age: 34, city: "Houston", state: "TX", area: "Montrose", category: "dating", body: "Career-driven woman who still makes time for fun. Looking for a confident gentleman with good energy.", img: g9, photos: [g9b, g9c], details: { gender: "Woman", height: "5'8\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Average", ethnicity: "Black / African American", languages: "English", lookingFor: "Men" }, phone: "(713) 555-0152", status: "published", postedAt: "2026-08-21T00:00:00.000Z", expiresAt: FOREVER, plan: "day" },
  { id: "g10", title: "Vinyl, ramen and late-night talks", name: "Linh", age: 24, city: "Seattle", state: "WA", area: "Capitol Hill", category: "dating", body: "I spend too much time in record stores. Let's swap playlists and find the best ramen in the city.", img: g10, photos: [g10b, g10c], details: { gender: "Woman", height: "5'1\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Slim", ethnicity: "Asian", languages: "English, Vietnamese", lookingFor: "Anyone" }, phone: "(206) 555-0171", status: "published", postedAt: "2026-08-20T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g11", title: "Gym partner & taco Tuesdays", name: "Marisol", age: 33, city: "Phoenix", state: "AZ", area: "Arcadia", category: "activity-partners", body: "Early-morning runner looking for a workout buddy who also appreciates a good taco afterward.", img: g11, photos: [g11b, g11c], details: { gender: "Woman", height: "5'5\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Athletic", ethnicity: "Hispanic / Latino", languages: "English, Spanish", lookingFor: "Anyone" }, phone: "(602) 555-0135", status: "published", postedAt: "2026-08-19T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g12", title: "Bookworm seeking a plot twist", name: "Rachel", age: 36, city: "Boston", state: "MA", area: "Back Bay", category: "dating", body: "Teacher by day, reader by night. Looking for someone thoughtful who can recommend a great book.", img: g12, photos: [g12b, g12c], details: { gender: "Woman", height: "5'6\"", hairColor: "Brown", eyeColor: "Hazel", bodyType: "Average", ethnicity: "White", languages: "English", lookingFor: "Men" }, phone: "(617) 555-0168", status: "published", postedAt: "2026-08-18T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g13", title: "City lights and slow dinners", name: "Mei", age: 29, city: "San Francisco", state: "CA", area: "Marina", category: "dating", body: "Designer who loves night walks by the water and trying new restaurants. Let's make a reservation.", img: g13, photos: [g13b, g13c], details: { gender: "Woman", height: "5'4\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Slim", ethnicity: "Asian", languages: "English, Chinese", lookingFor: "Men" }, phone: "(415) 555-0149", status: "published", postedAt: "2026-08-17T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g14", title: "Brunch queen looking for a king", name: "Amara", age: 27, city: "Nashville", state: "TN", area: "East Nashville", category: "dating", body: "Mimosas, live country music and good company. Looking for someone fun, honest and adventurous.", img: g14, photos: [g14b, g14c], details: { gender: "Woman", height: "5'6\"", hairColor: "Brown", eyeColor: "Brown", bodyType: "Curvy", ethnicity: "Mixed", languages: "English", lookingFor: "Men" }, phone: "(615) 555-0123", status: "published", postedAt: "2026-08-16T00:00:00.000Z", expiresAt: FOREVER, plan: "day" },
  { id: "g15", title: "Sunrise drives and desert skies", name: "Kai", age: 30, city: "Albuquerque", state: "NM", area: "Old Town", category: "dating", body: "I love road trips, stargazing and quiet mornings. Looking for someone grounded and real.", img: g15, photos: [g15b, g15c], details: { gender: "Woman", height: "5'5\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Average", ethnicity: "Native American", languages: "English", lookingFor: "Men" }, phone: "(505) 555-0157", status: "published", postedAt: "2026-08-15T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g16", title: "Let's dance the night away", name: "Isabella", age: 26, city: "Orlando", state: "FL", area: "Downtown", category: "hookups", body: "Outgoing, fun and always ready to hit the dance floor. Looking for good vibes and no drama. 18+ only.", img: g16, details: { gender: "Woman", height: "5'4\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Curvy", ethnicity: "Hispanic / Latino", languages: "English, Spanish", lookingFor: "Men" }, phone: "(407) 555-0119", status: "published", postedAt: "2026-08-14T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g17", title: "Island girl in the big city", name: "Leilani", age: 28, city: "Honolulu", state: "HI", area: "Kaimuki", category: "dating", body: "Beach days, ukulele and family barbecues. Looking for someone with a big heart and a good sense of humor.", img: g17, photos: [g17b, g17c], details: { gender: "Woman", height: "5'7\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Curvy", ethnicity: "Pacific Islander", languages: "English", lookingFor: "Men" }, phone: "(808) 555-0164", status: "published", postedAt: "2026-08-13T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g18", title: "Good energy only", name: "Tiana", age: 23, city: "Charlotte", state: "NC", area: "South End", category: "friendship", body: "Recent grad looking for people to try new spots, go to concerts and just vibe with.", img: g18, photos: [g18b, g18c], details: { gender: "Woman", height: "5'4\"", hairColor: "Black", eyeColor: "Brown", bodyType: "Slim", ethnicity: "Black / African American", languages: "English", lookingFor: "Anyone" }, phone: "(704) 555-0121", status: "published", postedAt: "2026-08-12T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g19", title: "Rainy days and jazz cafes", name: "Yuki", age: 32, city: "Seattle", state: "WA", area: "Fremont", category: "dating", body: "Calm, curious and a little bit shy at first. I love jazz, photography and walking in the rain.", img: g19, photos: [g19b, g19c], details: { gender: "Woman", height: "5'3\"", hairColor: "Brown", eyeColor: "Brown", bodyType: "Slim", ethnicity: "Asian", languages: "English, Japanese", lookingFor: "Men" }, phone: "(253) 555-0143", status: "published", postedAt: "2026-08-11T00:00:00.000Z", expiresAt: FOREVER },
  { id: "g20", title: "Wine country weekends", name: "Heather", age: 38, city: "Sacramento", state: "CA", area: "East Sacramento", category: "dating", body: "Love vineyard weekends, good coffee and gardening. Looking for a mature man who's ready for something real.", img: g20, photos: [g20b, g20c], details: { gender: "Woman", height: "5'6\"", hairColor: "Blonde", eyeColor: "Blue", bodyType: "Average", ethnicity: "White", languages: "English", lookingFor: "Men" }, phone: "(916) 555-0176", status: "published", postedAt: "2026-08-10T00:00:00.000Z", expiresAt: FOREVER },
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
