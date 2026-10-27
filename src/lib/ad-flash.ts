// Carries the "Your ad has been reposted" confirmation from the form to the page
// the person lands on. It rides along in the router's own page state, so it shows
// once on the page they arrive at and never ends up in a link they could share.
declare module "@tanstack/react-router" {
  interface HistoryState {
    adFlash?: string;
  }
}

export const adFlashState = (message: string) => ({ adFlash: message });
