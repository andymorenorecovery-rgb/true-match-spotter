import { describe, it, expect } from "vitest";
import { CITY_PAGES, findCityPage, inCity } from "./cities";

describe("city pages", () => {
  it("has 30 cities with unique slugs", () => {
    expect(CITY_PAGES).toHaveLength(30);
    expect(new Set(CITY_PAGES.map((p) => p.slug)).size).toBe(30);
  });
  it("only shows ads from that city and state", () => {
    const la = findCityPage("los-angeles")!;
    expect(inCity(la, { state: "CA", city: "Los Angeles" })).toBe(true);
    expect(inCity(la, { state: "CA", city: "San Diego" })).toBe(false);
    const portland = findCityPage("portland")!;
    expect(inCity(portland, { state: "ME", city: "Portland" })).toBe(false);
  });
  it("Washington DC page shows every DC ad", () => {
    expect(inCity(findCityPage("washington-dc")!, { state: "DC", city: "Capitol Hill" })).toBe(true);
  });
});
