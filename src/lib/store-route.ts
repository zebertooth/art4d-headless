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
  }

  return res;
}

export function getCartTokenFromRequest(
  request: Request,
): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`${CART_TOKEN_COOKIE}=([^;]+)`),
  );
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}
