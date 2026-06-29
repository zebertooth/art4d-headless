import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import type { WPLanguage } from "@/lib/types";
import type { Metadata } from "next";

import { getCategoryBySlug, getPostsByCategory } from "@/lib/wordpress";

export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Category" };
  return buildCategoryMetadata(cat.name, slug, lang);
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await getPostsByCategory(category.id, lang, 1, 20);

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading title={category.name} lang={lang} />

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="archive-grid">
            {posts.map((post) => (
              <ArticleCard key={post.id} post={post} variant="default" />
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              <AdSlot id={`cat-${slug}-sidebar`} size="medium-rectangle" />
              <AdSlot id={`cat-${slug}-sidebar-2`} size="medium-rectangle" />
            </div>
          </aside>
        </div>

        {posts.length === 0 && (
          <p className="text-neutral-500">
            {lang === "th" ? "ไม่พบบทความ" : "No articles in this category."}
          </p>
        )}
      </div>
    </SiteLayout>
  );
}
