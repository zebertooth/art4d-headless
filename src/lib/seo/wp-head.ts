/** Parsed SEO tags from a live WordPress/Yoast HTML page */
export type WpHeadSeo = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  hreflang?: Partial<Record<"en" | "th" | "x-default", string>>;
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .replace(/&#x([0-9a-f]+);/gi, (_, c) =>
      String.fromCharCode(parseInt(c, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

function matchMeta(html: string, key: string, attr: "name" | "property"): string | undefined {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${key}["']`,
    "i",
  );
  return decodeEntities(html.match(re)?.[1] ?? html.match(re2)?.[1] ?? "").trim() || undefined;
}

function parseHreflang(html: string): WpHeadSeo["hreflang"] {
  const map: NonNullable<WpHeadSeo["hreflang"]> = {};
  const re =
    /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const lang = m[1].toLowerCase();
    if (lang === "en" || lang === "th" || lang === "x-default") {
      map[lang] = m[2];
    }
  }
  return Object.keys(map).length ? map : undefined;
}

/** Fetch Yoast meta from the live WordPress page (cached). */
export async function fetchWpHeadSeo(wpUrl: string): Promise<WpHeadSeo | null> {
  try {
    const res = await fetch(wpUrl, {
      next: { revalidate: 3600 },
      headers: { Accept: "text/html" },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html;

    const title = decodeEntities(
      head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "",
    ).trim();

    const canonical = head.match(
      /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i,
    )?.[1];

    return {
      title: title || undefined,
      description: matchMeta(head, "description", "name"),
      canonical,
      ogTitle: matchMeta(head, "og:title", "property"),
      ogDescription: matchMeta(head, "og:description", "property"),
      ogImage: matchMeta(head, "og:image", "property"),
      ogUrl: matchMeta(head, "og:url", "property"),
      hreflang: parseHreflang(head),
    };
  } catch {
    return null;
  }
}
