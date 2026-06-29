import { notFound } from "next/navigation";
import Link from "next/link";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";
import { getPostsByCategory, getCategoryBySlug } from "@/lib/wordpress";

const microsites: Record<string, { title: string; categorySlug: string }> = {
  "co-space-1": { title: "CO.SPACE 1", categorySlug: "co-space" },
  "co-space-2": { title: "CO.SPACE 2", categorySlug: "co-space" },
};

export default async function MicrositePage({
  params,
  searchParams,
}: {
  params: Promise<{ segment?: string[] }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const segments = (await params).segment;
  const key = segments?.[0];
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  if (!key) {
    return (
      <SiteLayout lang={lang}>
        <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
          <SectionHeading title="Micro Site" lang={lang} />
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {Object.entries(microsites).map(([slug, site]) => (
              <Link
                key={slug}
                href={hrefWithLang(`/microsite/${slug}`, lang)}
                className="border border-neutral-200 p-8 hover:border-black"
              >
                <h2 className="font-display text-2xl">{site.title}</h2>
              </Link>
            ))}
          </div>
        </div>
      </SiteLayout>
    );
  }

  const site = microsites[key];
  if (!site) notFound();

  const cat = await getCategoryBySlug(site.categorySlug);
  const posts = cat ? await getPostsByCategory(cat.id, lang, 1, 12) : [];

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading title={site.title} lang={lang} />
        <p className="mb-10 text-sm text-neutral-500">
          {lang === "th" ? "รายการตีพิมพ์" : "Publication list"}
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} variant="compact" />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
