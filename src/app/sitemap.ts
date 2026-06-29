import type { MetadataRoute } from "next";
import { homeSections } from "@/lib/navigation";
import { getSiteUrl } from "@/lib/seo/site";
import { getPostHref } from "@/lib/utils";
import { getCategories, getPostsPage } from "@/lib/wordpress";

const STATIC_PATHS = [
  "/",
  "/th",
  "/shop",
  "/th/shop",
  "/contact",
  "/contact/about",
  "/contact/advertise",
  "/contact/newsletter",
  "/events",
  "/submission",
  "/microsite",
];

const CATEGORY_SLUGS = [
  "architecture",
  "design",
  "art",
  "interview",
  "people",
  "bites",
  "photo-essay",
  "book",
  "material",
  homeSections.coSpace,
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    entries.push({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: path === "/" ? "hourly" : "weekly",
      priority: path === "/" ? 1 : 0.6,
    });
  }

  for (const slug of CATEGORY_SLUGS) {
    for (const lang of ["en", "th"] as const) {
      const path =
        lang === "th" ? `/th/category/${slug}` : `/category/${slug}`;
      entries.push({
        url: `${siteUrl}${path}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  // All published articles for sitemap
  for (const lang of ["en", "th"] as const) {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const result = await getPostsPage(page, lang, 100);
      totalPages = result.totalPages;

      for (const post of result.posts) {
        entries.push({
          url: `${siteUrl}${getPostHref(post)}`,
          lastModified: new Date(post.modified ?? post.date),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }

      page++;
    }
  }

  try {
    const categories = await getCategories();
    for (const cat of categories) {
      if (cat.count > 0 && !CATEGORY_SLUGS.includes(cat.slug)) {
        entries.push({
          url: `${siteUrl}/category/${cat.slug}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    }
  } catch {
    // categories optional for sitemap
  }

  return entries;
}
