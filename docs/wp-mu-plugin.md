# WordPress mu-plugin — art4d Headless Bridge

Install the bridge plugin on **art4d.com** so the headless frontend can read Meta Slider slides via REST (fixes the empty top banner) and refresh instantly when editors publish.

## 1. Install the plugin

Copy this file to the WordPress server:

```
wordpress-mu-plugins/art4d-headless.php
  → wp-content/mu-plugins/art4d-headless.php
```

Mu-plugins load automatically — no activation step in wp-admin.

## 2. Add secrets to `wp-config.php`

Use the **same** secret on WordPress and Vercel:

```php
define('ART4D_HEADLESS_URL', 'https://art4d-headless.vercel.app');
define('ART4D_REVALIDATE_SECRET', 'your-long-random-string');
```

Generate a secret:

```bash
openssl rand -hex 32
```

On Vercel, set:

```
REVALIDATE_SECRET=<same-string>
```

Redeploy Vercel after adding the env var.

## 3. Verify Meta Slider REST

```bash
curl https://art4d.com/wp-json/art4d/v1/slideshow/57
curl https://art4d.com/wp-json/art4d/v1/slideshow/41249
curl https://art4d.com/wp-json/art4d/v1/slideshows
```

Expected: JSON with `slides[]` containing `id`, `href`, `image`, `title`.

Slideshow IDs used on the homepage:

| ID | Label |
|----|-------|
| 41249 | BANNER_TOP |
| 57 | FEATURED (hero) |
| 121869 | Lavamic_Banner |
| 126381 | Happitat_Banner |
| 120432 | Banner GILE 2026 |
| 122328 | Bluescope Banner |

Override in Vercel env if needed (`METASLIDER_*` in `.env.example`).

## 4. What the plugin does

- **`GET /wp-json/art4d/v1/slideshow/{id}`** — public read-only slideshow JSON
- **`GET /wp-json/art4d/v1/slideshows`** — list all published sliders
- **Publish webhook** — on `post`, `ml-slider`, or `ml-slide` save, pings `POST /api/revalidate` on the headless site

See also: [wp-revalidate.md](./wp-revalidate.md)

## 5. Headless fallback

Until the mu-plugin is installed, the Next.js app parses slideshow HTML from the live homepage (60s cache). REST is preferred when available.
