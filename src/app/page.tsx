import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { BookShopStrip } from "@/components/home/HomeSections";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { WebsiteJsonLd } from "@/components/seo/ArticleJsonLd";
import { heroOverlays } from "@/lib/home-hero";
import { homeSections } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { WPLanguage } from "@/lib/types";
import { getPostHref, getFeaturedImage, decodeHtmlEntities, stripHtml } from "@/lib/utils";
import { getCategoryBySlug, getPosts, getPostsByCategory } from "@/lib/wordpress";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  return buildPageMetadata({
    title:
      lang === "th"
        ? "art4d | นิตยสารสถาปัตยกรรม การออกแบบ และศิลปะ"
        : "art4d | Architecture, Design & Art Magazine",
    path: lang === "th" ? "/th" : "/",
    lang,
  });
}

async function loadCategoryPosts(slug: string, lang: WPLanguage, count: number) {
  const cat = await getCategoryBySlug(slug);
  if (!cat) return [];
  return getPostsByCategory(cat.id, lang, 1, count);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  let latest: Awaited<ReturnType<typeof getPosts>> = [];
  let bites: Awaited<ReturnType<typeof loadCategoryPosts>> = [];
  let photoEssays: Awaited<ReturnType<typeof loadCategoryPosts>> = [];
  let error: string | null = null;

  try {
    [latest, bites, photoEssays] = await Promise.all([
      getPosts(lang, 1, 16),
      loadCategoryPosts(homeSections.bites, lang, 4),
      loadCategoryPosts(homeSections.photoEssay, lang, 4),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load posts";
  }

  const heroPosts = latest.slice(0, 8);
  const heroSlides = heroPosts.flatMap((post, i) => {
    const image = getFeaturedImage(post)?.src;
    if (!image) return [];
    return [
      {
        id: post.id,
        href: getPostHref(post),
        image,
        title: decodeHtmlEntities(stripHtml(post.title.rendered)),
        overlay: heroOverlays[i],
      },
    ];
  });
  const gridPosts = latest.slice(5, 9);

  return (
    <SiteLayout lang={lang}>
      <WebsiteJsonLd />
      {error ? (
        <div className="mx-auto max-w-[1400px] px-4 py-16 text-center text-red-700">
          {error}
        </div>
      ) : (
        <>
          {/* Highlight — full-width hero slider (art4d.com style) */}
          <HomeHeroSlider slides={heroSlides} />

          {/* Ad position 1 */}
          <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
            <AdSlot id="home-banner-1" size="billboard" />
          </div>

          {/* Latest — 4 column grid */}
          <section className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6">
            <SectionHeading
              title={lang === "th" ? "บทความล่าสุด" : "Latest"}
              href="/category/design"
              lang={lang}
            />
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {gridPosts.map((post) => (
                <ArticleCard key={post.id} post={post} variant="default" />
              ))}
            </div>
          </section>

          {/* Ad position 2 */}
          <div className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6">
            <AdSlot id="home-banner-2" size="leaderboard" />
          </div>

          {/* BITES */}
          {bites.length > 0 && (
            <section className="border-t border-neutral-200 bg-neutral-50">
              <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
                <SectionHeading
                  title="Bites"
                  href={`/category/${homeSections.bites}`}
                  lang={lang}
                  subtitle={lang === "th" ? "อ่านสั้น" : "Short reads"}
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {bites.map((post) => (
                    <ArticleCard key={post.id} post={post} variant="compact" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Photo Essay */}
          {photoEssays.length > 0 && (
            <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
              <SectionHeading
                title={lang === "th" ? "ภาพเล่าเรื่อง" : "Photo Essay"}
                href={`/category/${homeSections.photoEssay}`}
                lang={lang}
              />
              <div className="grid gap-8 sm:grid-cols-2">
                {photoEssays.map((post) => (
                  <ArticleCard key={post.id} post={post} variant="default" />
                ))}
              </div>
            </section>
          )}

          {/* Sidebar ad — medium rectangle */}
          <div className="mx-auto max-w-[1400px] px-4 pb-12 sm:px-6">
            <div className="flex justify-center">
              <AdSlot
                id="home-rectangle-1"
                size="medium-rectangle"
                className="max-w-[336px]"
              />
            </div>
          </div>

          {/* Book shop — bottom of homepage */}
          <BookShopStrip lang={lang} />
        </>
      )}
    </SiteLayout>
  );
}
