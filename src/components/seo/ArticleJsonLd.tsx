import type { WPPost } from "@/lib/types";
import { decodeHtmlEntities, getPostHref, stripHtml } from "@/lib/utils";
import { getSiteUrl, PUBLISHER_LOGO, SITE_NAME } from "@/lib/seo/site";

export function ArticleJsonLd({ post }: { post: WPPost }) {
  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const description = stripHtml(post.excerpt.rendered).slice(0, 200);
  const image =
    post.featured_image_src ??
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const url = `${getSiteUrl()}${getPostHref(post)}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || undefined,
    image: image ? [image] : undefined,
    datePublished: post.date,
    dateModified: post.modified ?? post.date,
    inLanguage: post.lang === "th" ? "th-TH" : "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: post.author_info?.display_name
      ? { "@type": "Person", name: post.author_info.display_name }
      : { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${getSiteUrl()}${PUBLISHER_LOGO}`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: getSiteUrl(),
    description:
      "Architecture, design and art magazine from Thailand.",
    potentialAction: {
      "@type": "SearchAction",
      target: `${getSiteUrl()}/category/design?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
