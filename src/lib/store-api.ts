import {
  CART_TOKEN_COOKIE,
  STORE_API,
  type WCCart,
  type WCCartItem,
  type WCCheckout,
  type WCStoreProduct,
} from "@/lib/store-types";

export type StoreFetchResult<T> = {
  data: T;
  cartToken: string | null;
};

async function storeFetch<T>(
  path: string,
  options: RequestInit & { cartToken?: string | null } = {},
): Promise<StoreFetchResult<T>> {
  const { cartToken, ...init } = options;
  const headers = new Headers(init.headers);

  if (cartToken) {
    headers.set("Cart-Token", cartToken);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${STORE_API}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const newToken = res.headers.get("cart-token") ?? cartToken ?? null;

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Store API ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = (await res.json()) as T;
  return { data, cartToken: newToken };
}

export async function getProducts(params: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
}): Promise<{ products: WCStoreProduct[]; totalPages: number; total: number }> {
  const url = new URL(`${STORE_API}/products`);
  url.searchParams.set("page", String(params.page ?? 1));
  url.searchParams.set("per_page", String(params.perPage ?? 12));
  if (params.category) url.searchParams.set("category", params.category);
  if (params.search) url.searchParams.set("search", params.search);

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Store API products ${res.status}`);
  }

  return {
    products: (await res.json()) as WCStoreProduct[],
    total: Number(res.headers.get("X-WP-Total") ?? 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 1),
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<WCStoreProduct | null> {
  const url = new URL(`${STORE_API}/products`);
  url.searchParams.set("slug", slug);

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) return null;

  const products = (await res.json()) as WCStoreProduct[];
  return products[0] ?? null;
}

export async function getProductCategories() {
  const res = await fetch(`${STORE_API}/products/categories?per_page=20`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

/** Empty cart shell — avoids art4d.com GET /cart resetting the session token. */
function emptyCartShell(): WCCart {
  return {
    items: [],
    coupons: [],
    totals: {
      total_items: "0",
      total_shipping: "0",
      total_price: "0",
      currency_code: "THB",
      currency_minor_unit: 2,
      currency_prefix: "฿",
      currency_suffix: "",
    },
    shipping_address: {
      first_name: "",
      last_name: "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "TH",
      phone: "",
    },
    billing_address: {
      first_name: "",
      last_name: "",
      company: "",
      address_1: "",
      address_2: "",
      city: "",
      state: "",
      postcode: "",
      country: "TH",
      email: "",
      phone: "",
    },
    needs_payment: false,
    needs_shipping: false,
    shipping_rates: [],
    items_count: 0,
    payment_methods: [],
    errors: [],
  };
}

/** Build a cart view from /cart/items (avoids broken GET /cart and flaky update-item). */
function cartFromItems(
  items: WCCartItem[],
  cartToken: string | null,
): StoreFetchResult<WCCart> {
  if (!items.length) {
    return { data: emptyCartShell(), cartToken };
  }

  const shell = emptyCartShell();
  const { prices } = items[0];

  let totalMinor = 0;
  let itemsCount = 0;
  for (const item of items) {
    itemsCount += item.quantity;
    totalMinor += Number(item.totals.line_total);
  }

  return {
    data: {
      ...shell,
      items,
      items_count: itemsCount,
      totals: {
        total_items: String(totalMinor),
        total_shipping: "0",
        total_price: String(totalMinor),
        currency_code: prices.currency_code,
        currency_minor_unit: prices.currency_minor_unit,
        currency_prefix: prices.currency_prefix,
        currency_suffix: prices.currency_suffix,
      },
      needs_payment: totalMinor > 0,
    },
    cartToken,
  };
}

/**
 * Read cart. art4d WooCommerce GET /cart and /cart/items can disagree with the
 * session used by mutations — update-customer returns the authoritative cart.
 */
export async function getCart(
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCart>> {
  if (!cartToken) {
    return storeFetch<WCCart>("/cart", { cartToken });
  }

  const itemsResult = await storeFetch<WCCartItem[]>("/cart/items", {
    cartToken,
  });
  const listedItems = Array.isArray(itemsResult.data) ? itemsResult.data : [];

  if (!listedItems.length) {
    return {
      data: emptyCartShell(),
      cartToken: itemsResult.cartToken ?? cartToken,
    };
  }

  try {
    return await updateCartCustomer({}, cartToken);
  } catch {
    return cartFromItems(listedItems, itemsResult.cartToken ?? cartToken);
  }
}

export async function addToCart(
  productId: number,
  quantity: number,
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCart>> {
  return storeFetch<WCCart>("/cart/add-item", {
    method: "POST",
    cartToken,
    body: JSON.stringify({ id: productId, quantity }),
  });
}

export async function updateCartItem(
  key: string,
  quantity: number,
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCart>> {
  return storeFetch<WCCart>("/cart/update-item", {
    method: "POST",
    cartToken,
    body: JSON.stringify({ key, quantity }),
  });
}

export async function removeCartItem(
  key: string,
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCart>> {
  return storeFetch<WCCart>("/cart/remove-item", {
    method: "POST",
    cartToken,
    body: JSON.stringify({ key }),
  });
}

export async function updateCartCustomer(
  addresses: {
    billing_address?: Record<string, string>;
    shipping_address?: Record<string, string>;
  },
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCart>> {
  return storeFetch<WCCart>("/cart/update-customer", {
    method: "POST",
    cartToken,
    body: JSON.stringify(addresses),
  });
}

export async function selectShippingRate(
  packageId: number,
  rateId: string,
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCart>> {
  return storeFetch<WCCart>("/cart/select-shipping-rate", {
    method: "POST",
    cartToken,
    body: JSON.stringify({
      package_id: packageId,
      rate_id: rateId,
    }),
  });
}

export async function getCheckout(
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCheckout>> {
  return storeFetch<WCCheckout>("/checkout", { cartToken });
}

export async function updateCheckout(
  data: Record<string, unknown>,
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCheckout>> {
  return storeFetch<WCCheckout>("/checkout", {
    method: "PUT",
    cartToken,
    body: JSON.stringify(data),
  });
}

export async function processCheckout(
  data: {
    billing_address: Record<string, string>;
    shipping_address: Record<string, string>;
    payment_method: string;
    customer_note?: string;
  },
  cartToken?: string | null,
): Promise<StoreFetchResult<WCCheckout>> {
  return storeFetch<WCCheckout>("/checkout", {
    method: "POST",
    cartToken,
    body: JSON.stringify(data),
  });
}

export { CART_TOKEN_COOKIE };
