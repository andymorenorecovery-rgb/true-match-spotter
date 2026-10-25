// Single source of truth for the business identity and contact address.
// The company is registered as a limited liability company, so legal pages,
// the footer and payment screens must show the LLC name, not just the brand.
export const BRAND_NAME = "Ready Too Mingle";
export const BUSINESS_NAME = "Ready Too Mingle LLC";

// The owner registered the domain, so this is the real mailbox.
export const CONTACT_EMAIL = "readytoominglellc@readytoomingle.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;


// The real public address. Email links (verify, reset) always point here,
// even when someone signs up from an editor preview copy of the site.
export const SITE_URL = "https://readytoomingle.com";
export function publicOrigin(): string {
  if (typeof window === "undefined") return SITE_URL;
  const h = window.location.hostname;
  return /lovable(project)?\.(app|com|dev)$/.test(h) ? SITE_URL : window.location.origin;
}
