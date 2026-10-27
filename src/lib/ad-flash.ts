// A one-line confirmation ("Your ad has been reposted") that survives the jump
// from the form to the ad page, so people always see proof their ad went up.
const KEY = "rtm-ad-flash";

export function setAdFlash(message: string) {
  try {
    sessionStorage.setItem(KEY, message);
  } catch {
    /* private mode: the page they land on just won't show the note */
  }
}

/** Reads the confirmation and clears it, so it only ever shows once. */
export function takeAdFlash(): string {
  try {
    const value = sessionStorage.getItem(KEY) ?? "";
    sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return "";
  }
}
