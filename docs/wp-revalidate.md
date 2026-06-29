# WordPress publish webhook

Instantly refresh the headless site when editors publish or update content in WordPress.

## 1. Set the secret on Vercel

Add environment variable:

```
REVALIDATE_SECRET=<long-random-string>
```

Generate one with:

```bash
openssl rand -hex 32
```

## 2. Endpoint

```
POST https://art4d-headless.vercel.app/api/revalidate
Header: x-revalidate-secret: <your-secret>
Content-Type: application/json
```

### Body examples

Revalidate homepage and sitemap only:

```json
{}
```

Revalidate a specific article after publish:

```json
{
  "slug": "khotkool-office",
  "lang": "en"
}
```

Revalidate custom paths:

```json
{
  "paths": ["/category/design", "/th/category/design"]
}
```

## 3. WordPress setup

**Recommended:** install the mu-plugin — it handles publish webhooks automatically.

See **[wp-mu-plugin.md](./wp-mu-plugin.md)** (copy `wordpress-mu-plugins/art4d-headless.php` to `wp-content/mu-plugins/`).

Or add manually to `functions.php`:

```php
add_action('save_post', function ($post_id) {
    if (wp_is_post_revision($post_id) || wp_is_post_autosave($post_id)) return;
    if (get_post_status($post_id) !== 'publish') return;

    $post = get_post($post_id);
    if ($post->post_type !== 'post') return;

    $lang = function_exists('pll_get_post_language')
        ? pll_get_post_language($post_id)
        : 'en';

    wp_remote_post('https://art4d-headless.vercel.app/api/revalidate', [
        'headers' => [
            'Content-Type' => 'application/json',
            'x-revalidate-secret' => getenv('ART4D_REVALIDATE_SECRET'),
        ],
        'body' => wp_json_encode([
            'slug' => $post->post_name,
            'lang' => $lang,
        ]),
        'blocking' => false,
    ]);
});
```

Store `ART4D_REVALIDATE_SECRET` in `wp-config.php` or server env — never commit it.

## 4. Enable search indexing (at cutover)

On Vercel, set:

```
NEXT_PUBLIC_ALLOW_INDEXING=true
NEXT_PUBLIC_SITE_URL=https://art4d.com
```

Until then the demo uses `robots.txt` disallow all to avoid duplicate SEO.
