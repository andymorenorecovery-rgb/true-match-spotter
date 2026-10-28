<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project rules

- Prices and durations live only in `src/lib/pricing.ts`; never hardcode them elsewhere. Why: owner must change them without hunting through code.
- Listing ordering (featured rotation, expiry filtering) lives in `src/lib/listings.ts` as pure functions with tests. Why: core money logic must be testable and portable.
- Shared header/footer live in `src/routes/__root.tsx`; each page is its own route file. Why: real URLs for SEO.
- Keep dependencies portable (no host-only services without a documented alternative). Why: owner plans to self-host.
- Payments: checkout server functions live in `src/utils/payments.functions.ts`; ads/boosts are applied only after the server confirms the checkout was paid. Why: never trust the browser for money.
- Business identity (brand name, registered LLC name, contact email) lives in `src/lib/contact.ts`; legal, footer, age-gate and payment surfaces use the LLC name while marketing copy uses the brand name. Why: the company is a registered LLC and these facts must be changeable in one place.

- Accounts, invite rewards and reminders: server functions in `src/utils/account.functions.ts`; reward/reminder rules are pure functions in `src/lib/rewards.ts` with tests. Reminders are derived from ad end/boost times when the account is loaded (no scheduled jobs). Why: no extra moving parts on self-hosting, rules stay testable.
- Shared ads live in the `ads` table + private `ad-media` bucket (signed links made at read time); the owner's device keeps an editable copy and `src/lib/ad-sync.ts` uploads and publishes it. Only `publishAd` (`src/utils/ads.functions.ts`) can make an ad live: it proves payment via Stripe sessions or the owner's `user_ads` row, takes times from `src/lib/ad-window.ts`, and calls `publish_ad` with `AD_PUBLISH_SECRET` (hash in `app_secrets`; self-hosted servers need it in their env). Why: every phone must see every ad without trusting the browser or needing the service-role key.
- Auth-email webhook (`src/routes/lovable/email/auth/webhook.ts`): sends directly when `LOVABLE_API_KEY` is present (Lovable hosting injects it); on self-hosted servers without it, relays the signed request unchanged to the Lovable-hosted copy (default `https://true-match-spotter.lovable.app/lovable/email/auth/webhook`, override with `EMAIL_WEBHOOK_RELAY_URL`). Why: the managed email key never leaves Lovable hosting, so self-hosted sites must relay; keep the relay fallback published and current.
- The self-hosted server has no service-role key (Lovable Cloud never exposes it), so account logic must not use `supabaseAdmin`; privileged steps go in SECURITY DEFINER database functions keyed on `auth.uid()` and called with the user's client. Why: admin-key code silently breaks the live site (account page stuck on "Loading"). `recordCheckout` still uses it and needs moving.
- Google sign-in uses Lovable's /~oauth broker path, which only exists on Lovable hosting; the auth page hides the Google button on other hosts (self-hosted returns 404). Why: a broken button blocks sign-ups.
- Selfie video check: `src/lib/selfie-check.ts` samples frames in the browser and posts them with the main photo to `/api/public/verify-selfie` (AI vision: face visible in every frame + same person as photo); posting is blocked until it passes. Self-hosted servers without `LOVABLE_API_KEY` relay to the Lovable-hosted copy (`SELFIE_CHECK_RELAY_URL` overrides). Why: stops covered-camera and catfish videos without a host-only key on DreamHost.
- No-account giveaway ads: `publishAd` claims a spot via the `claim_guest_ad` database function (secret-gated, capped by `GIVEAWAY.spots` in pricing.ts, same ad keeps its spot on edits). Why: the free-ad limit must be enforced on the server, not the browser.
- Owner-device ad photos live in IndexedDB (`putAdPhotos` in `src/lib/ad-videos.ts`); `src/lib/local-ads.ts` keeps only text in localStorage and wait on `localAdsReady()` before reading photos. Why: iPhone localStorage (~5MB) overflowed with 10 photos ("photos too big").
