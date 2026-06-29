# QA checklist — art4d-headless

Use before team sign-off and production cutover.

## Automated

```bash
npm run audit                    # 100 EN + 100 TH posts + all nav routes
npm run audit -- --limit=200     # deeper post sample
npm run build
```

Target: **0 failures** on `https://art4d-headless.vercel.app` (or local after `npm run dev`).

## Manual — desktop

- [ ] Homepage: hero carousel, banner ads, Latest, Bites, Photo Essay, shop strip
- [ ] Article page: featured image, body HTML, EN↔TH link, sidebar ads (desktop)
- [ ] Category archive: pagination, inline ads, sticky sidebar
- [ ] Search: query returns results in EN and TH
- [ ] Events: competition, event, submit tabs
- [ ] Shop: product list, product detail, add to cart, checkout form
- [ ] Contact / legal / submission pages load
- [ ] Language switch: `/` ↔ `/th` preserves section

## Manual — mobile (375px)

- [ ] Header: no horizontal scroll; hamburger menu works
- [ ] Hero carousel: readable captions, dot navigation tappable
- [ ] Article: no overflow from wide embeds/tables
- [ ] Category: mobile ad stack at bottom (no sticky sidebar)
- [ ] Shop cart accessible from header

## Performance (Lighthouse)

Run in Chrome DevTools → Lighthouse → Mobile on:

1. `/` (homepage)
2. `/en/2026/06/maibantat-design-office` (or latest article)
3. `/category/design`

Targets (guideline):

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| CLS | < 0.1 |
| Performance | > 80 |

## WordPress bridge

- [ ] Mu-plugin installed: `docs/wp-mu-plugin.md`
- [ ] `GET /wp-json/art4d/v1/slideshow/41249` returns slides (top banner)
- [ ] `REVALIDATE_SECRET` set on Vercel + `wp-config.php`
- [ ] Publish a test post → headless page updates within ~1 min

## Team sign-off

- [ ] Editorial: content fidelity vs art4d.com
- [ ] Design: layout, typography, ads placement
- [ ] Tech: audit pass, rollback plan agreed
