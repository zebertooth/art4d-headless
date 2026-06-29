import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  eventSectionKeys,
  eventSections,
  resolveEventSectionKey,
} from "@/lib/events";
import { hrefWithLang } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { WPLanguage } from "@/lib/types";
import {
  getCategoryBySlug,
  getPostsByCategoryPaged,
  searchPostsPaged,
} from "@/lib/wordpress";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

const PER_PAGE = 24;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ segment?: string[] }>;
  searchParams: Promise<{ lang?: string; page?: string }>;
}): Promise<Metadata> {
  const segments = (await params).segment;
  const key = resolveEventSectionKey(segments?.[0]);
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const section = eventSections[key];

  const path = key ? `/events/${key}` : "/events";
  return buildPageMetadata({
    title: section.title[lang],
    description: section.body[lang],
    path: lang === "th" ? `/th${path}` : path,
    lang,
  });
}

async function loadEventPosts(
  key: ReturnType<typeof resolveEventSectionKey>,
  lang: WPLanguage,
  page: number,
) {
  const section = eventSections[key];

  if (section.categorySlug) {
    const category = await getCategoryBySlug(section.categorySlug);
    if (!category) return { items: [], totalPages: 0 };
    return getPostsByCategoryPaged(category.id, lang, page, PER_PAGE);
  }

  if (section.searchQuery) {
    return searchPostsPaged(section.searchQuery, lang, page, PER_PAGE);
  }

  return { items: [], totalPages: 0 };
}

export default async function EventsPage({
  params,
  searchParams,
}: {
  params: Promise<{ segment?: string[] }>;
  searchParams: Promise<{ lang?: string; page?: string }>;
}) {
  const segments = (await params).segment;
  const rawKey = segments?.[0];

  if (rawKey && !(rawKey in eventSections)) notFound();

  const key = resolveEventSectionKey(rawKey);
  const { lang: langParam, page: pageParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const section = eventSections[key];

  const showGrid = key !== "submit";
  const { items: posts, totalPages } = showGrid
    ? await loadEventPosts(key, lang, currentPage)
    : { items: [], totalPages: 0 };

  if (showGrid && currentPage > totalPages && totalPages > 0) notFound();

  const basePath = key ? `/events/${key}` : "/events";

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading title={section.title[lang]} lang={lang} />
        <p className="mt-4 max-w-2xl text-lg text-neutral-600">{section.body[lang]}</p>

        <AdSlot id="events-banner" size="leaderboard" className="my-10" />

        <nav className="mb-10 flex flex-wrap gap-4 border-b border-neutral-200 pb-6 text-sm">
          {eventSectionKeys.map((k) => (
            <Link
              key={k}
              href={hrefWithLang(k ? `/events/${k}` : "/events", lang)}
              className={
                k === key
                  ? "font-medium text-black underline underline-offset-4"
                  : "text-neutral-500 hover:text-black"
              }
            >
              {eventSections[k].title[lang]}
            </Link>
          ))}
        </nav>

        {key === "submit" ? (
          <div className="max-w-xl space-y-4 text-neutral-700">
            <p>
              {lang === "th"
                ? "ส่งผลงานหรือข่าวของคุณผ่านแบบฟอร์มติดต่อทีมบรรณาธิการ"
                : "Send your project or news to the art4d editorial team."}
            </p>
            <Link
              href={hrefWithLang("/submission/contact", lang)}
              className="inline-block border border-black px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-black hover:text-white"
            >
              {lang === "th" ? "ไปที่แบบฟอร์ม" : "Go to contact form"}
            </Link>
          </div>
        ) : (
          <ArticleGrid
            posts={posts}
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
            lang={lang}
            emptyMessage={
              lang === "th" ? "ไม่พบบทความ" : "No articles found."
            }
          />
        )}
      </div>
    </SiteLayout>
  );
}
