import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_TOKEN_COOKIE } from "@/lib/store-api";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function jsonWithCartToken<T extends Record<string, unknown>>(
  data: T,
  cartToken: string | null,
  init?: ResponseInit,
  requestToken?: string | null,
): NextResponse {
  let tokenToSet = cartToken;

  const itemsCount =
    typeof data.items_count === "number" ? data.items_count : undefined;

  // WooCommerce on art4d.com may return a fresh empty-session token on GET /cart.
  if (
    requestToken &&
    cartToken &&
    cartToken !== requestToken &&
    itemsCount === 0
  ) {
    tokenToSet = requestToken;
  }

  const body =
    tokenToSet && typeof data === "object" && data !== null
      ? { ...data, _cartToken: tokenToSet }
      : data;

  const res = NextResponse.json(body, init);

  if (tokenToSet) {
    res.cookies.set(CART_TOKEN_COOKIE, tokenToSet, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    res.headers.set("Cart-Token", tokenToSet);
  }

  return res;
}

export async function getCartTokenFromRequest(
  request: Request,
): Promise<string | undefined> {
  const headerToken = request.headers.get("Cart-Token");
  if (headerToken) return headerToken;

  const cookieStore = await cookies();
  return cookieStore.get(CART_TOKEN_COOKIE)?.value;
}
