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
