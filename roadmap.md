# Ready Too Mingle roadmap

- [x] Phase 1: Rebrand, pricing config, responsive pages (home, listings, ad page, pricing, FAQ, contact, privacy, terms)
- [ ] Phase 2: Accounts, dashboard, create/edit ads (needs Lovable Cloud)
- [ ] Phase 3: Real location search, listing expiry on the server
- [ ] Phase 4: Payments in test mode, $20 standard ad
- [ ] Phase 5: $120 7-day Featured boost with fair rotation
- [ ] Phase 6: Admin, moderation, messaging, reporting/blocking
- [ ] Phase 7: Tests, docs, backups, independent-hosting migration guide
- [x] Checkout for $20 / $120 ads and $10 boost (test mode)
- [ ] Ask owner: what should happen on purchase/refund (no subscriptions in this app)
- [ ] Owner added "Ready Too Mingle" to the LLC registration — verify every legal/money surface shows "Ready Too Mingle LLC" and marketing keeps the brand name
- [x] DreamHost: build + run on VPS (port 8000, proxy added, Stripe keys in)
- [x] DreamHost: GoDaddy A @ and www point to 69.163.185.245
- [ ] DreamHost: HTTPS on the proxy — port 443 refuses; no cert issued yet (Stripe return URL and HSTS both need it)
- [ ] DreamHost: auto-start the site after a server reboot (needs the secret key in a root-only env file, not a crontab line)
