const STORAGE_KEY = "wc_cart_token";

/** Turn Store API proxy errors into readable messages. */
export function formatStoreError(message: string): string {
  const jsonStart = message.indexOf("{");
  if (jsonStart === -1) return message;

  try {
    const parsed = JSON.parse(message.slice(jsonStart)) as {
      message?: string;
      data?: { errors?: { billing?: string[]; shipping?: string[] } };
    };
    if (parsed.data?.errors?.billing?.[0]) return parsed.data.errors.billing[0];
    if (parsed.data?.errors?.shipping?.[0]) return parsed.data.errors.shipping[0];
    if (parsed.message) return parsed.message;
  } catch {
    // fall through
  }

  return message;
}

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
    throw new Error(formatStoreError(raw.error ?? `Request failed (${res.status})`));
  }

  return raw as T;
}
