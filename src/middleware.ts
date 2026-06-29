import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Rewrite /th/* to internal routes with lang=th (matches art4d.com URL style). */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/th" || pathname === "/th/") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("lang", "th");
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/th/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    url.searchParams.set("lang", "th");
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/th", "/th/:path*"],
};
