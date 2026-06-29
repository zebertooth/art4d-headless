import type { Metadata } from "next";
import type { WPLanguage, WPPost } from "@/lib/types";
import { getPostHref, stripHtml, decodeHtmlEntities } from "@/lib/utils";
import { fetchWpHeadSeo } from "./wp-head";
import {
  DEFAULT_DESCRIPTION,
  getSiteUrl,
  OG_IMAGE,
  SITE_NAME,
} from "./site";

function excerptDescription(post: WPPost, max = 160): string {
  const fromExcerpt = stripHtml(post.excerpt.rendered);
  if (fromExcerpt.length >= 40) return fromExcerpt.slice(0, max);

  const fromContent = stripHtml(post.content.rendered);
  return fromContent.slice(0, max).trim();
}

function toAbsoluteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http")) return pathOrUrl;
  return `${getSiteUrl()}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function buildAlternates(
  post: WPPost,
  translationPost?: WPPost | null,
): Metadata["alternates"] {
  const canonical = toAbsoluteUrl(getPostHref(post));
  const languages: Record<string, string> = {};

  if (post.lang) {
    languages[post.lang] = canonical;
  }
  if (translationPost?.lang) {
    languages[translationPost.lang] = toAbsoluteUrl(getPostHref(translationPost));
  }
  if (languages.en) {
    languages["x-default"] = languages.en;
  }

  return { canonical, languages: Object.keys(languages).length ? languages : undefined };
}

export async function buildArticleMetadata(
  post: WPPost,
  translationPost?: WPPost | null,
): Promise<Metadata> {
  const wpSeo = post.link ? await fetchWpHeadSeo(post.link) : null;

  const fallbackTitle = decodeHtmlEntities(stripHtml(post.title.rendered));
  const title =
    wpSeo?.ogTitle?.replace(/\s*\|\s*art4d\s*$/i, "") ??
    wpSeo?.title?.replace(/\s*\|\s*art4d\s*$/i, "") ??
    fallbackTitle;

  const description =
    wpSeo?.ogDescription ?? wpSeo?.description ?? excerptDescription(post);

  const image = getFeaturedImageUrl(post) ?? wpSeo?.ogImage;
  const canonical = toAbsoluteUrl(getPostHref(post));
  const lang = post.lang ?? "en";

  return {
    title,
    description,
    alternates: buildAlternates(post, translationPost),
    openGraph: {
      type: "article",
      locale: lang === "th" ? "th_TH" : "en_US",
      alternateLocale: lang === "th" ? ["en_US"] : ["th_TH"],
      url: canonical,
      siteName: SITE_NAME,
      title,
      description,
      publishedTime: post.date,
      modifiedTime: post.modified ?? post.date,
      images: image ? [{ url: image, alt: fallbackTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

function getFeaturedImageUrl(post: WPPost): string | undefined {
  if (post.featured_image_src) return post.featured_image_src;
  return post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
}

export function buildPageMetadata({
  title,
  description,
  path,
  lang = "en",
  image,
  robots,
}: {
  title: string;
  description?: string;
  path: string;
  lang?: WPLanguage;
  image?: string;
  robots?: Metadata["robots"];
}): Metadata {
  const desc = description ?? DEFAULT_DESCRIPTION[lang];
  const canonical = toAbsoluteUrl(path);
  const ogImage = image ? toAbsoluteUrl(image) : toAbsoluteUrl(OG_IMAGE);

  return {
    title,
    description: desc,
    alternates: {
      canonical,
      languages:
        path === "/" || path === "/th"
          ? {
              en: toAbsoluteUrl("/"),
              th: toAbsoluteUrl("/th"),
              "x-default": toAbsoluteUrl("/"),
            }
          : undefined,
    },
    openGraph: {
      type: "website",
      locale: lang === "th" ? "th_TH" : "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title,
      description: desc,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
    },
    robots: robots ?? { index: true, follow: true },
  };
}

export function buildCategoryMetadata(
  name: string,
  slug: string,
  lang: WPLanguage,
  page = 1,
): Metadata {
  const pageSuffix = page > 1 ? (lang === "th" ? ` — หน้า ${page}` : ` — Page ${page}`) : "";
  const title =
    lang === "th" ? `${name} | บทความ${pageSuffix}` : `${name} | Articles${pageSuffix}`;
  const description =
    lang === "th"
      ? `บทความหมวด ${name} จาก art4d`
      : `${name} articles from art4d — architecture, design and art magazine.`;

  const path =
    page > 1
      ? lang === "th"
        ? `/th/category/${slug}?page=${page}`
        : `/category/${slug}?page=${page}`
      : lang === "th"
        ? `/th/category/${slug}`
        : `/category/${slug}`;

  return buildPageMetadata({
    title,
    description,
    path,
    lang,
  });
}
