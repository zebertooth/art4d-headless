const STORAGE_KEY = "wc_cart_token";

/** Read cart token saved from the last store API response. */
export function getStoredCartToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredCartToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) sessionStorage.setItem(STORAGE_KEY, token);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Client fetch wrapper — sends cookies + cart token header. */
export async function storeFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getStoredCartToken();
  if (token) headers.set("Cart-Token", token);

  const res = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  const newToken = res.headers.get("Cart-Token");
  if (newToken) setStoredCartToken(newToken);

  const raw = (await res.json()) as T & { _cartToken?: string; error?: string };

  if (raw._cartToken) {
    setStoredCartToken(raw._cartToken);
    delete raw._cartToken;
  }

  if (!res.ok) {
    throw new Error(raw.error ?? `Request failed (${res.status})`);
  }

  return raw as T;
}
