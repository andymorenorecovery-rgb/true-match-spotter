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
- [x] DreamHost: HTTPS working on the proxy (Let's Encrypt cert for readytoomingle.com, valid to Jan 2027)
- [ ] DreamHost: run `bash ~/site/scripts/deploy.sh` so the new icon files (favicon.ico, apple-touch-icon.png, icon-512.png) reach the server — all three 404 there now
- [x] Update workflow: scripts/deploy.sh (pull + rebuild + restart), scripts/start-site.sh (start only, used by @reboot)
- [ ] DreamHost one-time: both Stripe keys into ~/.site-env (600), then register @reboot start-site.sh


- [ ] Video selfie anti-cheat: face must be visible and well lit, face visible the whole video (no head turn), face must match ad photos
