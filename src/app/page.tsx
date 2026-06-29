import { ArticleCard } from "@/components/articles/ArticleCard";
import {
  HomepageBannerRow,
} from "@/components/home/MetaSliderBlock";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import { BookShopStrip } from "@/components/home/HomeSections";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { WebsiteJsonLd } from "@/components/seo/ArticleJsonLd";
import { heroOverlays } from "@/lib/home-hero";
import {
  getHomepageSlideshows,
  metaSlidesToCarousel,
} from "@/lib/metaslider";
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

  const slideshowsPromise = getHomepageSlideshows();

  try {
    [latest, bites, photoEssays] = await Promise.all([
      getPosts(lang, 1, 16),
      loadCategoryPosts(homeSections.bites, lang, 4),
      loadCategoryPosts(homeSections.photoEssay, lang, 4),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load posts";
  }

  const { bannerTop, hero, banners } = await slideshowsPromise;

  const heroPosts = latest.slice(0, 8);
  const postHeroSlides = heroPosts.flatMap((post, i) => {
    const image = getFeaturedImage(post)?.src;
    if (!image) return [];
    return [
      {
        id: String(post.id),
        href: getPostHref(post),
        image,
        title: decodeHtmlEntities(stripHtml(post.title.rendered)),
        badge: heroOverlays[i]?.badge,
        subtitle: heroOverlays[i]?.subtitle,
      },
    ];
  });

  const metaHeroSlides = hero?.slides.length
    ? metaSlidesToCarousel(hero).map((s, i) => ({
        ...s,
        badge: heroOverlays[i]?.badge,
        subtitle: heroOverlays[i]?.subtitle,
      }))
    : [];

  const heroSlides = metaHeroSlides.length ? metaHeroSlides : postHeroSlides;
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
          {/* Top banner — Meta Slider BANNER_TOP (art4d.com) */}
          {bannerTop?.slides.length ? (
            <PromoCarousel
              slides={metaSlidesToCarousel(bannerTop)}
              variant="banner"
              aspectWidth={bannerTop.width}
              aspectHeight={bannerTop.height}
              label={bannerTop.label}
            />
          ) : null}

          {heroSlides.length > 0 ? (
            <PromoCarousel
              slides={heroSlides}
              variant="hero"
              aspectWidth={hero?.width ?? 1200}
              aspectHeight={hero?.height ?? 675}
              label={hero?.label ?? "Featured"}
              showCaption
            />
          ) : null}

          <HomepageBannerRow
            slideshow={banners[0]}
            fallbackAdId="home-banner-1"
            adSize="billboard"
          />

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

          <HomepageBannerRow
            slideshow={banners[1]}
            fallbackAdId="home-banner-2"
            adSize="leaderboard"
            padding="pb-8"
          />

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

          <HomepageBannerRow
            slideshow={banners[2] ?? banners[3]}
            fallbackAdId="home-rectangle-1"
            adSize="medium-rectangle"
            padding="pb-12"
          />

          {/* Book shop — bottom of homepage */}
          <BookShopStrip lang={lang} />
        </>
      )}
    </SiteLayout>
  );
}
