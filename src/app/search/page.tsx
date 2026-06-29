import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { SearchForm } from "@/components/layout/SearchForm";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { WPLanguage } from "@/lib/types";
import { searchPostsPaged } from "@/lib/wordpress";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

const PER_PAGE = 24;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; q?: string; page?: string }>;
}): Promise<Metadata> {
  const { lang: langParam, q, page: pageParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const query = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);

  if (!query) {
    return buildPageMetadata({
      title: lang === "th" ? "ค้นหา" : "Search",
      path: lang === "th" ? "/th/search" : "/search",
      lang,
    });
  }

  const pageSuffix = page > 1 ? (lang === "th" ? ` — หน้า ${page}` : ` — Page ${page}`) : "";
  const path =
    page > 1
      ? lang === "th"
        ? `/th/search?q=${encodeURIComponent(query)}&page=${page}`
        : `/search?q=${encodeURIComponent(query)}&page=${page}`
      : lang === "th"
        ? `/th/search?q=${encodeURIComponent(query)}`
        : `/search?q=${encodeURIComponent(query)}`;

  return buildPageMetadata({
    title: lang === "th" ? `ค้นหา: ${query}${pageSuffix}` : `Search: ${query}${pageSuffix}`,
    path,
    lang,
    robots: { index: false, follow: true },
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; q?: string; page?: string }>;
}) {
  const { lang: langParam, q, page: pageParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const query = q?.trim() ?? "";
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const { items: posts, totalPages } = query
    ? await searchPostsPaged(query, lang, currentPage, PER_PAGE)
    : { items: [], totalPages: 0 };

  if (query && currentPage > totalPages && totalPages > 0) notFound();

  const basePath = query ? `/search?q=${encodeURIComponent(query)}` : "/search";

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading title={lang === "th" ? "ค้นหา" : "Search"} lang={lang} />

        <div className="mt-6 max-w-md">
          <SearchForm lang={lang} defaultQuery={query} />
        </div>

        {query ? (
          <div className="mt-10">
            <p className="mb-8 text-sm text-neutral-500">
              {lang === "th"
                ? `ผลลัพธ์สำหรับ “${query}”`
                : `Results for “${query}”`}
            </p>
            <ArticleGrid
              posts={posts}
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={basePath}
              lang={lang}
              queryParams={{ q: query }}
              emptyMessage={
                lang === "th" ? "ไม่พบบทความ" : "No articles found."
              }
            />
          </div>
        ) : (
          <p className="mt-10 text-neutral-500">
            {lang === "th"
              ? "พิมพ์คำค้นหาแล้วกดค้นหา"
              : "Enter a search term above."}
          </p>
        )}
      </div>
    </SiteLayout>
  );
}
