import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { hrefWithLang } from "@/lib/navigation";
import { getPostById, getPostBySlug } from "@/lib/wordpress";
import type { WPLanguage } from "@/lib/types";
import {
  decodeHtmlEntities,
  formatPostDate,
  getFeaturedImage,
  getPostHref,
  getPrimaryCategory,
  stripHtml,
} from "@/lib/utils";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: langParam, slug } = await params;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const post = await getPostBySlug(slug, lang);
  if (!post) return { title: "Article" };
  return {
    title: decodeHtmlEntities(stripHtml(post.title.rendered)),
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{
    lang: string;
    year: string;
    month: string;
    slug: string;
  }>;
}) {
  const { lang: langParam, slug } = await params;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  const post = await getPostBySlug(slug, lang);
  if (!post) notFound();

  const image = getFeaturedImage(post);
  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const category = getPrimaryCategory(post);

  const otherLang: WPLanguage = lang === "en" ? "th" : "en";
  const translationId = post.translations?.[otherLang];
  const translationPost = translationId
    ? await getPostById(translationId)
    : null;

  return (
    <SiteLayout lang={lang}>
      <article>
        {/* Hero */}
        <header className="mx-auto max-w-4xl px-4 pt-10 sm:px-6 sm:pt-16">
          <Link
            href={hrefWithLang("/", lang)}
            className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 hover:text-black"
          >
            ← {lang === "th" ? "หน้าแรก" : "Home"}
          </Link>

          {category && (
            <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
              {category}
            </p>
          )}

          <h1 className="mt-4 font-display text-4xl leading-[1.1] text-black sm:text-5xl lg:text-6xl">
            {title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-neutral-200 pb-8 text-sm text-neutral-500">
            {post.author_info?.display_name && (
              <span>{post.author_info.display_name}</span>
            )}
            <time>{formatPostDate(post.date, lang)}</time>
            {translationPost && (
              <Link
                href={getPostHref(translationPost)}
                className="underline hover:text-black"
              >
                {lang === "en" ? "อ่านภาษาไทย" : "Read in English"}
              </Link>
            )}
          </div>
        </header>

        {image && (
          <div className="mx-auto mt-8 max-w-5xl px-4 sm:px-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1200px) 100vw, 1024px"
              />
            </div>
          </div>
        )}

        {/* Body + sidebar ad */}
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            <div
              className="article-content max-w-2xl text-neutral-800"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                <AdSlot id="article-sidebar-1" size="medium-rectangle" />
                <AdSlot id="article-sidebar-2" size="medium-rectangle" />
              </div>
            </aside>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <AdSlot id="article-footer-banner" size="billboard" />
        </div>
      </article>
    </SiteLayout>
  );
}
