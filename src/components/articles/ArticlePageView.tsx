import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdOneColumn, AdTwoColumn } from "@/components/ads/AdColumns";
import { MobileAdStack } from "@/components/ads/MobileAdStack";
import { StickyAdRail } from "@/components/ads/StickyAdRail";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { hrefWithLang } from "@/lib/navigation";
import { buildArticleMetadata } from "@/lib/seo/metadata";
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

export async function renderArticlePage(slug: string, lang: WPLanguage) {
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
      <ArticleJsonLd post={post} />
      <article>
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

          <h1 className="mt-4 font-display text-3xl leading-[1.15] text-black sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-neutral-200 pb-8 text-sm text-neutral-500">
            {post.author_info?.display_name && (
              <span>{post.author_info.display_name}</span>
            )}
            <time dateTime={post.date}>{formatPostDate(post.date, lang)}</time>
            {translationPost && (
              <Link
                href={getPostHref(translationPost)}
                className="underline hover:text-black"
                hrefLang={otherLang}
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

        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
            <div className="min-w-0 space-y-10">
              <AdOneColumn id="article-top-leaderboard" size="leaderboard" className="lg:hidden" />

              <div
                className="article-content max-w-2xl text-neutral-800"
                dangerouslySetInnerHTML={{ __html: post.content.rendered }}
              />

              <AdOneColumn id="article-mid-banner" size="billboard" />

              <AdTwoColumn idPrefix="article-mid-pair" />
            </div>

            <StickyAdRail
              slots={[
                { id: "article-sidebar-1", size: "medium-rectangle" },
                { id: "article-sidebar-2", size: "medium-rectangle" },
              ]}
            />
          </div>

          <MobileAdStack
            slots={[
              { id: "article-mobile-1", size: "medium-rectangle" },
              { id: "article-mobile-2", size: "medium-rectangle" },
              { id: "article-mobile-banner", size: "leaderboard" },
            ]}
          />
        </div>

        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <AdOneColumn id="article-footer-banner" size="billboard" />
        </div>
      </article>
    </SiteLayout>
  );
}

export async function articleMetadata(slug: string, lang: WPLanguage) {
  const post = await getPostBySlug(slug, lang);
  if (!post) return { title: "Article" };

  const otherLang: WPLanguage = lang === "en" ? "th" : "en";
  const translationId = post.translations?.[otherLang];
  const translationPost = translationId
    ? await getPostById(translationId)
    : null;

  return buildArticleMetadata(post, translationPost);
}
