import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: allowIndexing ? "/" : undefined,
      disallow: allowIndexing ? ["/api/"] : ["/"],
    },
    sitemap: allowIndexing ? `${siteUrl}/sitemap.xml` : undefined,
    host: allowIndexing ? siteUrl : undefined,
  };
}
