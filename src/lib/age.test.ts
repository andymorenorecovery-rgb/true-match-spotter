import { describe, expect, it } from "vitest";
import { ageFrom } from "./age";

const today = new Date(Date.UTC(2026, 9, 28));

describe("ageFrom", () => {
  it("turns 18 on the birthday", () => expect(ageFrom(2008, 10, 28, today)).toBe(18));
  it("is 17 the day before turning 18", () => expect(ageFrom(2008, 10, 29, today)).toBe(17));
  it("rejects impossible dates", () => expect(ageFrom(2000, 2, 31, today)).toBeNull());
});
