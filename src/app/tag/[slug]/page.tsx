import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { WPLanguage } from "@/lib/types";
import { getPostsByTagPaged, getTagBySlug } from "@/lib/wordpress";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

const PER_PAGE = 24;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; page?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang: langParam, page: pageParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const page = Math.max(1, Number(pageParam) || 1);
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag" };

  const pageSuffix = page > 1 ? (lang === "th" ? ` — หน้า ${page}` : ` — Page ${page}`) : "";
  const path =
    page > 1
      ? lang === "th"
        ? `/th/tag/${slug}?page=${page}`
        : `/tag/${slug}?page=${page}`
      : lang === "th"
        ? `/th/tag/${slug}`
        : `/tag/${slug}`;

  return buildPageMetadata({
    title: lang === "th" ? `${tag.name} | แท็ก${pageSuffix}` : `${tag.name} | Tag${pageSuffix}`,
    path,
    lang,
  });
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { lang: langParam, page: pageParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const { items: posts, totalPages } = await getPostsByTagPaged(
    tag.id,
    lang,
    currentPage,
    PER_PAGE,
  );

  if (currentPage > totalPages && totalPages > 0) notFound();

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading title={tag.name} lang={lang} subtitle="Tag" />
        <div className="mt-8">
          <ArticleGrid
            posts={posts}
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/tag/${slug}`}
            lang={lang}
            emptyMessage={
              lang === "th" ? "ไม่พบบทความในแท็กนี้" : "No articles with this tag."
            }
          />
        </div>
      </div>
    </SiteLayout>
  );
}
