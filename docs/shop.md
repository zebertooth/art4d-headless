# WooCommerce shop (headless)

The shop uses **WooCommerce Store API** on art4d.com. Cart sessions use a server-side proxy (`/api/store/*`) with an httpOnly `wc_cart_token` cookie.

## Payment gateways

Configured in WordPress WooCommerce:

- `paysolutions` — Pay Solutions
- `paypal` — PayPal

Checkout redirects to the gateway; Pay Solutions postback must hit WordPress:

```
https://art4d.com/?wc-api=WC_amdev_Paysolutions
```

Set **Return URL** in Pay Solutions to your thank-you page, e.g.:

```
https://art4d-headless.vercel.app/shop/order-received
```

## Product types

| Type | WooCommerce | Checkout |
|------|-------------|----------|
| Books (shipping) | Simple product, not virtual | Shipping address + rates |
| Digital download | Virtual + Downloadable | No shipping; download email from WooCommerce |

## Routes

| Path | Purpose |
|------|---------|
| `/shop` | Product catalog |
| `/shop/[slug]` | Product detail |
| `/shop/cart` | Cart |
| `/shop/checkout` | Checkout + payment |
| `/shop/order-received` | Thank you page |

## Env

Uses `WORDPRESS_API_URL` (default `https://art4d.com/wp-json`). Store API base is derived automatically.
