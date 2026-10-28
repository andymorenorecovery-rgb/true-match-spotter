import { describe, expect, it } from "vitest";
import { RULES } from "@/components/PostAgreement";

const text = RULES.map(([, b]) => b).join(" ");

describe("posting rules", () => {
  it("bans sex for money and prostitution", () => {
    expect(text).toMatch(/do not allow.*do not promote prostitution of any kind/si);
    expect(text).toMatch(/sex for money/i);
  });

  it("says the site is for dating and hookups only", () => {
    expect(text).toMatch(/ad company for dating and for people who want to hook up/i);
  });

  it("states the site is not responsible for members' actions", () => {
    expect(text).toMatch(/We are not responsible for what people do/i);
  });

  it("warns rule-breakers get kicked off when reported", () => {
    expect(text).toMatch(/kicked off the site with no refund/i);
  });
});
