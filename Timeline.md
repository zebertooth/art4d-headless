# Timeline — art4d.com headless migration

Migration roadmap for moving art4d.com from WordPress theme to a headless Next.js frontend. The **main site keeps running** until Phase 4 cutover.

**Legend:** ✅ Done · 🔄 In progress · ⏳ Pending

---

## Overview

| Phase | Name | Duration | Status |
|-------|------|----------|--------|
| 0 | Backup & inventory | ~1 week | ⏳ Pending |
| 1 | Headless demo | ~4–6 weeks | 🔄 In progress |
| 2 | S3 + CloudFront images | ~1–2 weeks | ⏳ Pending |
| 3 | Image selling (WooCommerce) | ~1–2 weeks | ⏳ Pending |
| 4 | Production cutover | ~1–2 weeks | ⏳ Pending |

**Total estimate:** ~2–3 months to production (Phases 1–4).

---

## Phase 0 — Backup & inventory

**Duration:** ~1 week  
**Status:** ⏳ Pending

Establish a safe baseline before any infrastructure or frontend changes.

### Checklist

- [ ] Full WordPress database export
- [ ] Backup entire `wp-content/uploads/` (largest asset)
- [ ] Backup themes, plugins, `wp-config.php`
- [ ] Host-level snapshot if available
- [ ] Count posts by language (EN / TH)
- [ ] Count media files and total storage (GB)
- [ ] Document custom post types, categories, ACF fields
- [ ] Document active plugins (Polylang, Yoast, WooCommerce, etc.)
- [ ] Verify REST API: `https://art4d.com/wp-json/wp/v2/posts?per_page=1`
- [ ] Store backups off-server (S3 or local archive)

### Deliverables

- Backup restore tested once
- Content inventory spreadsheet or script output

---

## Phase 1 — Headless demo (current)

**Duration:** ~4–6 weeks  
**Status:** 🔄 In progress  
**Demo URL (planned):** `https://demo.art4d.com`

Build Next.js frontend reading **live** WordPress API. Production `art4d.com` unchanged.

### Completed

- [x] Next.js 16 project scaffolded (`art4d-headless`)
- [x] TypeScript + Tailwind CSS v4
- [x] `npm install` — dependencies installed
- [x] WordPress types (`src/lib/types.ts`)
- [x] URL utilities for `/en/YYYY/MM/slug` (`src/lib/utils.ts`)
- [x] `.env.example` with API URL and revalidation settings
- [x] Project docs (`CLAUDE.md`, `AGENTS.md`, `Timeline.md`)

### In progress / next

- [ ] `src/lib/wordpress.ts` API client
- [ ] Homepage — latest articles from WP
- [ ] Article page route `[lang]/[year]/[month]/[slug]`
- [ ] Category archive pages
- [ ] Header with EN / TH language switch
- [ ] `next/image` + `remotePatterns` for art4d.com uploads
- [ ] SEO metadata from post data
- [ ] Deploy to Vercel → `demo.art4d.com`
- [ ] Internal QA vs production (side-by-side)

### Week breakdown (estimate)

| Week | Focus |
|------|-------|
| 1 | API client, homepage, post card component |
| 2 | Article pages, featured images, HTML content |
| 3 | Categories, pagination, language switcher |
| 4 | SEO, performance pass, mobile layout |
| 5–6 | Deploy demo, team review, fix gaps |

### Exit criteria

- Demo site mirrors top 50+ production pages accurately
- Lighthouse / Core Web Vitals better than current theme
- Team approves design and content fidelity

---

## Phase 2 — S3 + CloudFront image migration

**Duration:** ~1–2 weeks  
**Status:** ⏳ Pending  
**Depends on:** Phase 1 demo stable

Move media off the WordPress server for speed, cost, and future commerce.

### Checklist

- [ ] Create AWS S3 bucket (private originals)
- [ ] CloudFront distribution in front of S3
- [ ] Bulk upload `wp-content/uploads/` to S3 (preserve paths)
- [ ] Script: replace image URLs in post HTML (staging first)
- [ ] Update `next.config.ts` `images.remotePatterns` for CloudFront
- [ ] New uploads pipeline → S3 (plugin or custom)
- [ ] Compare image load times demo vs production
- [ ] Redirect map for any URL changes (prefer none)

### Exit criteria

- All demo site images served via CloudFront
- No broken images on staging QA pass
- Originals not publicly listable (bucket policy)

---

## Phase 3 — Image selling (self-hosted)

**Duration:** ~1–2 weeks  
**Status:** ⏳ Pending  
**Depends on:** Phase 2 (S3 for secure downloads)

Sell images on own site only — **not** a contributor marketplace.

### Checklist

- [ ] WooCommerce digital download products (staging)
- [ ] Product ↔ S3 original file mapping
- [ ] Watermarked preview generation for shop/listing images
- [ ] Stripe or PayPal checkout
- [ ] Presigned S3 download URL after payment (expiring link)
- [ ] Shop section: `/shop` or in-article "Buy" buttons
- [ ] License terms page (personal / commercial)
- [ ] Test full purchase → download flow

### Out of scope

- Contributor uploads
- Revenue splits / Stripe Connect
- Subscription marketplace

### Exit criteria

- End-to-end purchase works on staging
- Full-res files not accessible without payment

---

## Phase 4 — Production cutover

**Duration:** ~1–2 weeks  
**Status:** ⏳ Pending  
**Depends on:** Phases 1–3 complete (or 1 only if shop deferred)

Switch `art4d.com` to the headless frontend.

### Pre-cutover checklist

- [ ] Top 100 URLs compared (content, images, meta)
- [ ] `hreflang` EN/TH verified
- [ ] `sitemap.xml` working on new frontend
- [ ] 301 redirects for any changed paths
- [ ] Google Search Console sitemap re-submitted
- [ ] Rollback plan documented (revert DNS to old theme)

### Cutover steps

1. Final content sync / cache warm
2. Point `art4d.com` DNS to Vercel (or Cloudflare → Vercel)
3. Move WordPress to `cms.art4d.com` (admin + API only; disable public theme)
4. Monitor 404s and Search Console for 2 weeks
5. Keep old theme/server available 30 days for rollback

### Post-cutover

- [ ] Fix any 404s from redirect gaps
- [ ] Monitor Core Web Vitals in Search Console
- [ ] Decommission old public theme when stable

### Exit criteria

- `art4d.com` served by Next.js for 30+ days without major issues
- SEO rankings stable or improved
- Editors publishing normally via WordPress admin

---

## Risk register

| Risk | Mitigation |
|------|------------|
| SEO drop from URL changes | Keep slug structure; 301 map |
| Broken inline images in old posts | URL rewrite script + QA |
| Polylang translation links break | Test `translations` field on every template |
| Demo leaks to Google | `robots.txt` noindex on demo until ready |
| Rollback needed | Keep old site 30 days; DNS revert plan |

---

## Status log

| Date | Update |
|------|--------|
| 2026-06-29 | Phase 1 started — Next.js scaffold, types, utils, docs |
| — | Phase 0 backup not yet started |
| — | Demo deploy to `demo.art4d.com` not yet started |

---

*Update this file when phases complete or dates shift.*
