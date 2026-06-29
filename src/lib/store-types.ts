export const STORE_API_BASE =
  process.env.WORDPRESS_API_URL?.replace(/\/wp-json$/, "") ??
  "https://art4d.com";

export const STORE_API = `${STORE_API_BASE}/wp-json/wc/store/v1`;

export const CART_TOKEN_COOKIE = "wc_cart_token";

export const PAYMENT_METHODS = [
  { id: "paysolutions", label: { en: "Pay Solutions", th: "Pay Solutions" } },
  { id: "paypal", label: { en: "PayPal", th: "PayPal" } },
] as const;

export type WCPrice = {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_code: string;
  currency_symbol: string;
  currency_minor_unit: number;
  currency_prefix: string;
  currency_suffix: string;
};

export type WCProductImage = {
  id: number;
  src: string;
  thumbnail: string;
  srcset: string;
  sizes: string;
  name: string;
  alt: string;
};

export type WCProductCategory = {
  id: number;
  name: string;
  slug: string;
};

export type WCStoreProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  short_description: string;
  description: string;
  on_sale: boolean;
  prices: WCPrice;
  images: WCProductImage[];
  categories: WCProductCategory[];
  is_purchasable: boolean;
  is_in_stock: boolean;
  add_to_cart: {
    minimum: number;
    maximum: number;
  };
};

export type WCCartItem = {
  key: string;
  id: number;
  quantity: number;
  name: string;
  short_description: string;
  description: string;
  sku: string;
  low_stock_remaining: number | null;
  backorders_allowed: boolean;
  show_backorder_badge: boolean;
  sold_individually: boolean;
  permalink: string;
  images: WCProductImage[];
  variation: unknown[];
  prices: WCPrice;
  totals: {
    line_subtotal: string;
    line_subtotal_tax: string;
    line_total: string;
    line_total_tax: string;
  };
};

export type WCCart = {
  items: WCCartItem[];
  coupons: unknown[];
  totals: {
    total_items: string;
    total_shipping: string | null;
    total_price: string;
    currency_code: string;
    currency_minor_unit: number;
    currency_prefix: string;
    currency_suffix: string;
  };
  shipping_address: WCAddress;
  billing_address: WCAddress;
  needs_payment: boolean;
  needs_shipping: boolean;
  shipping_rates: WCShippingRate[];
  items_count: number;
  payment_methods: string[];
  errors: Array<{ code: string; message: string }>;
};

export type WCAddress = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone: string;
};

export type WCShippingRate = {
  package_id: number;
  name: string;
  destination: WCAddress;
  items: Array<{ key: string; name: string; quantity: number }>;
  shipping_rates: Array<{
    rate_id: string;
    name: string;
    description: string;
    delivery_time: string;
    price: string;
    taxes: string;
    instance_id: number;
    method_id: string;
    meta_data: unknown[];
    selected: boolean;
    currency_code: string;
    currency_minor_unit: number;
  }>;
};

export type WCCheckout = {
  order_id: number;
  status: string;
  order_key: string;
  billing_address: WCAddress;
  shipping_address: WCAddress;
  payment_method: string;
  payment_result: {
    payment_status: string;
    redirect_url: string;
  };
};

export function formatStorePrice(
  amount: string,
  prices: Pick<
    WCPrice,
    "currency_minor_unit" | "currency_prefix" | "currency_suffix"
  >,
): string {
  const value = Number(amount) / 10 ** prices.currency_minor_unit;
  return `${prices.currency_prefix}${value.toLocaleString("en-US", {
    minimumFractionDigits: prices.currency_minor_unit,
    maximumFractionDigits: prices.currency_minor_unit,
  })}${prices.currency_suffix}`;
}

export function stripProductHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
