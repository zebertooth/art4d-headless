import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { Pagination } from "@/components/layout/Pagination";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import type { WPLanguage } from "@/lib/types";
import type { Metadata } from "next";

import { getCategoryBySlug, getPostsByCategoryPaged } from "@/lib/wordpress";

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
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Category" };
  return buildCategoryMetadata(cat.name, slug, lang, page);
}

export default async function CategoryPage({
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

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const { items: posts, totalPages } = await getPostsByCategoryPaged(
    category.id,
    lang,
    currentPage,
    PER_PAGE,
  );

  if (currentPage > totalPages && totalPages > 0) notFound();

  const basePath = `/category/${slug}`;

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading title={category.name} lang={lang} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="archive-grid">
              {posts.map((post) => (
                <ArticleCard key={post.id} post={post} variant="default" />
              ))}
            </div>

            {posts.length === 0 && (
              <p className="text-neutral-500">
                {lang === "th" ? "ไม่พบบทความ" : "No articles in this category."}
              </p>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={basePath}
              lang={lang}
            />
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <AdSlot id={`cat-${slug}-sidebar`} size="medium-rectangle" />
              <AdSlot id={`cat-${slug}-sidebar-2`} size="medium-rectangle" />
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  );
}
