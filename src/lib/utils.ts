import type { ArticlePath, WPLanguage, WPPost } from "./types";

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export function parseArticlePathFromLink(link: string): ArticlePath | null {
  try {
    const pathname = new URL(link).pathname;
    const match = pathname.match(/^\/(en|th)\/(\d{4})\/(\d{2})\/([^/]+)\/?$/);
    if (!match) return null;

    return {
      lang: match[1] as WPLanguage,
      year: match[2],
      month: match[3],
      slug: match[4],
    };
  } catch {
    return null;
  }
}

export function buildArticleHref(path: ArticlePath): string {
  return `/${path.lang}/${path.year}/${path.month}/${path.slug}`;
}

export function getPostHref(post: WPPost): string {
  const parsed = parseArticlePathFromLink(post.link);
  if (parsed) return buildArticleHref(parsed);
  return `/${post.lang ?? "en"}/article/${post.slug}`;
}

export function getFeaturedImage(post: WPPost): {
  src: string;
  alt: string;
  width?: number;
  height?: number;
} | null {
  if (post.featured_image_src) {
    return { src: post.featured_image_src, alt: stripHtml(post.title.rendered) };
  }

  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return null;

  return {
    src: media.source_url,
    alt: media.alt_text || stripHtml(post.title.rendered),
    width: media.media_details?.width,
    height: media.media_details?.height,
  };
}

export function getPrimaryCategory(post: WPPost): string | null {
  const terms = post._embedded?.["wp:term"]?.[0];
  if (!terms?.length) return null;
  return terms[0].name;
}

export function formatPostDate(date: string, lang: WPLanguage): string {
  return new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
