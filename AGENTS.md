# AGENTS.md — art4d-headless

Guidance for Cursor and other AI agents working on this repository.

## Project goals

Migrate [art4d.com](https://art4d.com) from traditional WordPress to a **headless architecture** for speed and flexibility, without disrupting the live site.

| Goal | Detail |
|------|--------|
| Faster frontend | Static/ISR pages, optimized images, edge caching |
| Same editorial workflow | WordPress admin unchanged for editors |
| Safe rollout | Demo subdomain first; production cutover only after QA |
| Future commerce | Sell own images via WooCommerce (not a marketplace) |

## Current phase

**Phase 1 — Headless demo (in progress)**

- Next.js app scaffolded; WordPress types and URL utilities in place.
- Next: API client, homepage, article pages, EN/TH routing, deploy to `demo.art4d.com`.
- Main site at `art4d.com` is **untouched**.

See `Timeline.md` for full roadmap.

## Architecture

```
┌─────────────────┐     REST API (read-only)     ┌──────────────────┐
│  demo.art4d.com │  ──────────────────────────► │  art4d.com       │
│  Next.js        │                              │  WordPress CMS   │
│  (this repo)    │                              │  (production)    │
└─────────────────┘                              └──────────────────┘
         │                                                │
         │  Phase 2+: CloudFront                          │  Editors
         ▼                                                ▼
┌─────────────────┐                              ┌──────────────────┐
│  S3 + CloudFront│                              │  wp-admin        │
│  (future)       │                              │  (unchanged)     │
└─────────────────┘                              └──────────────────┘
```

**Rendering strategy:** App Router + ISR (`REVALIDATE_SECONDS`). Optionally add on-demand revalidation via WordPress publish webhooks later.

## File / folder map

### Current

| Path | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout, fonts, metadata |
| `src/app/page.tsx` | Homepage (placeholder — wire to WP) |
| `src/app/globals.css` | Tailwind v4 theme |
| `src/lib/types.ts` | `WPPost`, `WPCategory`, `WPLanguage`, `ArticlePath` |
| `src/lib/utils.ts` | HTML helpers, URL parsing, featured image extraction |
| `.env.example` | Environment variable template |
| `next.config.ts` | Next config (add `images.remotePatterns` for art4d.com) |

### Planned

| Path | Purpose |
|------|---------|
| `src/lib/wordpress.ts` | Centralized API client |
| `src/components/Header.tsx` | Site header + language switch |
| `src/components/PostCard.tsx` | Article card for listings |
| `src/components/ArticleBody.tsx` | Render post content |
| `src/app/[lang]/page.tsx` | Language home |
| `src/app/[lang]/[year]/[month]/[slug]/page.tsx` | Article detail |
| `src/app/[lang]/category/[slug]/page.tsx` | Category archive |

## WordPress API integration patterns

### Base URL

```ts
const base = process.env.WORDPRESS_API_URL ?? "https://art4d.com/wp-json";
const postsUrl = `${base}/wp/v2/posts`;
```

### Fetch with embed (featured image + terms)

```
GET /wp/v2/posts?per_page=12&page=1&_embed&lang=en
```

Use `_embed` to populate `_embedded["wp:featuredmedia"]` and `_embedded["wp:term"]`. art4d.com also provides `featured_image_src` directly on posts.

### Pagination

Read `X-WP-Total` and `X-WP-TotalPages` response headers for list pagination.

### Single post by slug

```
GET /wp/v2/posts?slug=khotkool-office&lang=en
```

### Language switching

Use `post.translations` to link EN ↔ TH versions:

```ts
// translations: { en: 127043, th: 127023 }
const thaiId = post.translations?.th;
```

### ISR example

```ts
export const revalidate = Number(process.env.REVALIDATE_SECONDS ?? 60);
```

### Image domains

Add to `next.config.ts`:

```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "art4d.com", pathname: "/wp-content/uploads/**" }],
},
```

## Migration strategy

1. **Demo first** — deploy this repo to `demo.art4d.com`; production unchanged.
2. **Read live API** — Phase 1 uses production WordPress as CMS (read-only).
3. **Staging clone (optional)** — for S3 migration and WooCommerce tests, use a WP staging copy.
4. **Parallel QA** — compare top 50–100 URLs on demo vs production.
5. **Cutover** — point `art4d.com` DNS to Vercel; move WordPress admin to `cms.art4d.com`; keep rollback for 30 days.

## Testing checklist (before production cutover)

- [ ] Homepage loads latest articles (EN + TH)
- [ ] Article URLs match `/en/YYYY/MM/slug` and `/th/YYYY/MM/slug`
- [ ] Featured images and inline gallery images render
- [ ] Language switcher links correct translation
- [ ] Category and tag pages work
- [ ] Meta title, description, OG image present
- [ ] `hreflang` for bilingual pairs
- [ ] `sitemap.xml` generates (fix production 500 if applicable)
- [ ] Mobile layout and Core Web Vitals acceptable
- [ ] 301 redirects for any changed paths
- [ ] No broken links on top 100 pages

## Commit / PR conventions

- **Commits:** only when the user explicitly asks. Use concise messages focused on *why*.
- **Scope:** small, reviewable changes — one feature or fix per PR when possible.
- **Do not commit:** `.env.local`, secrets, large binaries.
- **PR summary:** include test plan and note any demo URL to verify.

## Common agent tasks

### Add a new page

1. Create route under `src/app/`.
2. Fetch data in a Server Component via `src/lib/wordpress.ts`.
3. Add types if new WP fields are used.
4. Update navigation in `Header` when it exists.

### Fix API / data issues

1. Verify endpoint in browser: `https://art4d.com/wp-json/wp/v2/posts?per_page=1`.
2. Check `src/lib/types.ts` matches actual JSON shape.
3. Log response in dev only; remove before merge.

### Add a component

1. Place in `src/components/`.
2. Prefer Server Components; use `"use client"` only for interactivity.
3. Match Tailwind patterns in existing pages.

### Deploy to Vercel

1. Push repo to GitHub.
2. Import project in Vercel; framework preset: Next.js.
3. Set env vars: `WORDPRESS_API_URL`, `REVALIDATE_SECONDS`, `NEXT_PUBLIC_SITE_URL`.
4. Add custom domain `demo.art4d.com` (CNAME to Vercel).
5. Run `npm run build` locally first to catch errors.

### Prepare S3 image migration (Phase 2)

1. Do **not** change production URLs until redirect map is ready.
2. Add CloudFront domain to `images.remotePatterns`.
3. Script URL replacement in post HTML on staging first.

### Add image selling (Phase 3)

1. WooCommerce digital products on WordPress (staging).
2. Watermarked previews in frontend; full download via presigned S3 URL after checkout.
3. Headless checkout can use WooCommerce Store API or embedded flow — confirm approach with user before implementing.

## Constraints for agents

- Minimize scope; do not over-engineer.
- Never write to production WordPress.
- Preserve production URL structure.
- Read `CLAUDE.md` and `Timeline.md` before large changes.
