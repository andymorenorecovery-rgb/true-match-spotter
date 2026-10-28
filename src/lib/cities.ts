// City landing pages for search (/personals/<slug>). Plain data so it stays portable.
// `cities` lists the exact city names ads use; null means every ad in that state (DC).
export type CityPage = { slug: string; name: string; state: string; stateName: string; cities: string[] | null };

const c = (slug: string, name: string, state: string, stateName: string, cities: string[] | null = [name]): CityPage =>
  ({ slug, name, state, stateName, cities });

export const CITY_PAGES: CityPage[] = [
  c("new-york", "New York", "NY", "New York", ["New York City", "New York", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]),
  c("los-angeles", "Los Angeles", "CA", "California"),
  c("chicago", "Chicago", "IL", "Illinois"),
  c("houston", "Houston", "TX", "Texas"),
  c("phoenix", "Phoenix", "AZ", "Arizona"),
  c("philadelphia", "Philadelphia", "PA", "Pennsylvania"),
  c("san-antonio", "San Antonio", "TX", "Texas"),
  c("san-diego", "San Diego", "CA", "California"),
  c("dallas", "Dallas", "TX", "Texas"),
  c("austin", "Austin", "TX", "Texas"),
  c("jacksonville", "Jacksonville", "FL", "Florida"),
  c("fort-worth", "Fort Worth", "TX", "Texas"),
  c("san-jose", "San Jose", "CA", "California"),
  c("columbus", "Columbus", "OH", "Ohio"),
  c("charlotte", "Charlotte", "NC", "North Carolina"),
  c("indianapolis", "Indianapolis", "IN", "Indiana"),
  c("san-francisco", "San Francisco", "CA", "California"),
  c("seattle", "Seattle", "WA", "Washington"),
  c("denver", "Denver", "CO", "Colorado"),
  c("nashville", "Nashville", "TN", "Tennessee"),
  c("oklahoma-city", "Oklahoma City", "OK", "Oklahoma"),
  c("washington-dc", "Washington, DC", "DC", "District of Columbia", null),
  c("el-paso", "El Paso", "TX", "Texas"),
  c("las-vegas", "Las Vegas", "NV", "Nevada"),
  c("boston", "Boston", "MA", "Massachusetts"),
  c("detroit", "Detroit", "MI", "Michigan"),
  c("portland", "Portland", "OR", "Oregon"),
  c("memphis", "Memphis", "TN", "Tennessee"),
  c("atlanta", "Atlanta", "GA", "Georgia"),
  c("miami", "Miami", "FL", "Florida"),
];

export function findCityPage(slug: string): CityPage | undefined {
  return CITY_PAGES.find((p) => p.slug === slug);
}

export function inCity(page: CityPage, ad: { state: string; city: string }): boolean {
  if (ad.state !== page.state) return false;
  return page.cities === null || page.cities.includes(ad.city);
}
