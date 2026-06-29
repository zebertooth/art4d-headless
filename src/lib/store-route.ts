import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CART_TOKEN_COOKIE } from "@/lib/store-api";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function jsonWithCartToken<T>(
  data: T,
  cartToken: string | null,
  init?: ResponseInit,
): NextResponse {
  const res = NextResponse.json(data, init);

  if (cartToken) {
    res.cookies.set(CART_TOKEN_COOKIE, cartToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });
    // Mirror for client sessionStorage fallback (non-httpOnly)
    res.headers.set("Cart-Token", cartToken);
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
