# art4d-headless — AI Assistant Context

## Project purpose

Headless frontend demo for [art4d.com](https://art4d.com), an architecture and design magazine. The production WordPress site stays live; this repo powers a separate demo (`demo.art4d.com` planned) before eventual cutover.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **CMS (read-only API):** WordPress at `https://art4d.com`
- **API:** WordPress REST API (`/wp-json/wp/v2/`)
- **Languages:** English + Thai via Polylang (`lang`, `translations` on posts)
- **Future:** S3 + CloudFront for images; WooCommerce for self-hosted image sales (not a marketplace)

## Environment variables

| Variable | Purpose |
|----------|---------|
| `WORDPRESS_API_URL` | API base, e.g. `https://art4d.com/wp-json` |
| `REVALIDATE_SECONDS` | ISR cache TTL (default `60`) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for metadata |

Copy `.env.example` to `.env.local` for local dev.

## URL patterns

Match production slugs:

- `/en/YYYY/MM/slug`
- `/th/YYYY/MM/slug`

Preserve these exactly for SEO when demo becomes production.

## Folder structure

```
src/
  app/           # Next.js routes
  lib/
    types.ts     # WordPress API types
    utils.ts     # Helpers (slug parsing, strip HTML, etc.)
```

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm run lint
```

## Conventions

- Fetch WordPress data server-side in Server Components
- Use ISR (`revalidate`) — do not hit WP on every page view
- Use `next/image` for art4d.com media; configure `remotePatterns` in `next.config.ts`
- Decode HTML entities in titles/excerpts from WP `rendered` fields
- Keep diffs small; match existing TypeScript and Tailwind patterns

## What NOT to do

- Do not modify production WordPress or DNS without explicit approval
- Do not commit `.env.local` or secrets
- Do not change live URL slugs without a 301 redirect plan
- Do not build a contributor marketplace — only direct image sales on this site (future phase)

## Roadmap

See `Timeline.md` for phased migration. Current phase: **Phase 1 — headless demo**.
