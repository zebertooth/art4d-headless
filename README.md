# art4d-headless

Headless Next.js demo for [art4d.com](https://art4d.com). Reads live content from WordPress REST API.

## Stack

- Next.js 16, TypeScript, Tailwind CSS v4
- WordPress API at `https://art4d.com/wp-json`
- Deploy target: Vercel (`demo.art4d.com`)

## Environment variables

Copy `.env.example` to `.env.local`:

```
WORDPRESS_API_URL=https://art4d.com/wp-json
REVALIDATE_SECONDS=60
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

On Vercel, set `NEXT_PUBLIC_SITE_URL` to your deployment URL (e.g. `https://demo.art4d.com`).

## Commands

```bash
npm install
npm run dev
npm run build
```

## Docs

- `CLAUDE.md` — project context
- `AGENTS.md` — agent guide
- `Timeline.md` — migration phases
