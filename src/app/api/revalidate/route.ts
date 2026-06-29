import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getPostHref } from "@/lib/utils";
import { getPostBySlug } from "@/lib/wordpress";
import type { WPLanguage } from "@/lib/types";

type RevalidatePayload = {
  slug?: string;
  lang?: WPLanguage;
  paths?: string[];
};

/** On-demand ISR — call from WordPress on publish/update. */
export async function POST(request: NextRequest) {
  const secret =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let payload: RevalidatePayload = {};

  try {
    payload = (await request.json()) as RevalidatePayload;
  } catch {
    // Allow empty body — revalidate common paths only
  }

  const paths = new Set<string>([
    "/",
    "/th",
    "/sitemap.xml",
    ...(payload.paths ?? []),
  ]);

  if (payload.slug && payload.lang) {
    const post = await getPostBySlug(payload.slug, payload.lang);
    if (post) {
      paths.add(getPostHref(post));
    }
  }

  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    paths: [...paths],
    now: Date.now(),
  });
}
