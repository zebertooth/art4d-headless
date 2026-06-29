import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";
import { getPosts } from "@/lib/wordpress";

export const revalidate = 60;

async function getLang(searchParams: Promise<{ lang?: string }>): Promise<WPLanguage> {
  const { lang } = await searchParams;
  return lang === "th" ? "th" : "en";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const lang = await getLang(searchParams);
  const posts = await getPosts(lang, 1, 6);

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading
          title={lang === "th" ? "ร้านค้า" : "Shop"}
          lang={lang}
          subtitle={lang === "th" ? "หนังสือและสินค้าออกแบบ" : "Books & design products"}
        />

        <AdSlot id="shop-highlight" size="billboard" className="mb-10" />

        <SectionHeading
          title={lang === "th" ? "ล่าสุด" : "Latest"}
          lang={lang}
        />
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <ArticleCard key={post.id} post={post} variant="default" />
          ))}
        </div>

        <div className="my-10">
          <AdSlot id="shop-banner" size="leaderboard" />
        </div>

        <SectionHeading
          title={lang === "th" ? "สินค้าออกแบบ" : "Design Products"}
          lang={lang}
        />
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(3, 6).map((post) => (
            <ArticleCard key={post.id} post={post} variant="compact" />
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-neutral-500">
          {lang === "th"
            ? "ร้านค้าออนไลน์เต็มรูปแบบ — เฟส 3 (WooCommerce)"
            : "Full e-commerce — Phase 3 (WooCommerce integration)"}
        </p>
      </div>
    </SiteLayout>
  );
}
