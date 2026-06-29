# Production cutover checklist

Switch public traffic from the WordPress theme to the Next.js frontend.

**Prerequisites:** Phase 1b QA complete (`docs/qa-checklist.md`).

---

## 1. Backups (Phase 0)

- [ ] Full WordPress database export
- [ ] Backup `wp-content/uploads/`
- [ ] Backup themes, plugins, `wp-config.php`
- [ ] Test restore once off-server

## 2. Environment

### Vercel (production)

```
WORDPRESS_API_URL=https://art4d.com/wp-json
NEXT_PUBLIC_SITE_URL=https://art4d.com
NEXT_PUBLIC_ALLOW_INDEXING=true
REVALIDATE_SECRET=<secret>
REVALIDATE_SECONDS=60
```

### WordPress `wp-config.php`

```php
define('ART4D_HEADLESS_URL', 'https://art4d.com');
define('ART4D_REVALIDATE_SECRET', '<same-as-vercel>');
```

Install mu-plugin: `wordpress-mu-plugins/art4d-headless.php` → `wp-content/mu-plugins/`

## 3. Optional demo domain

Point `demo.art4d.com` CNAME to Vercel before cutover for side-by-side review:

1. Vercel project → Settings → Domains → add `demo.art4d.com`
2. DNS: `demo` CNAME → `cname.vercel-dns.com`
3. Keep `NEXT_PUBLIC_SITE_URL` as demo URL until final cutover

## 4. Pre-cutover QA

- [ ] `npm run audit` — 0 failures against production Vercel URL
- [ ] Top 100 EN + TH URLs spot-checked
- [ ] `hreflang` on article pages (view source / Rich Results Test)
- [ ] `sitemap.xml` lists posts
- [ ] `robots.txt` allows indexing when flag is true
- [ ] Shop checkout tested with real payment (staging or low-value order)
- [ ] 301 redirect map for any path changes (prefer none)

## 5. Cutover day

1. Lower DNS TTL 24h before (if self-managed)
2. Final `npm run audit` on Vercel production build
3. Point `art4d.com` DNS to Vercel (or Cloudflare → Vercel)
4. Move WordPress admin to `cms.art4d.com` (optional but recommended)
5. Disable public theme on WordPress (API-only)
6. Re-submit sitemap in Google Search Console
7. Monitor 404s and Search Console for 2 weeks

## 6. Rollback

If critical issues within 30 days:

1. Revert DNS to old WordPress host
2. Re-enable public theme
3. Set `NEXT_PUBLIC_ALLOW_INDEXING=false` on demo if still running

Keep old server available **30 days** minimum.

## 7. Post-cutover (deferred)

- Phase 2: S3 + CloudFront images
- Phase 3: secure digital downloads for image sales

See `Timeline.md` for full roadmap.
