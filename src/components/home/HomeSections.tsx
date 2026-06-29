import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { WPPost } from "@/lib/types";
import { getPostHref, stripHtml, decodeHtmlEntities } from "@/lib/utils";

export function HeroFeature({ posts }: { posts: WPPost[] }) {
  if (!posts.length) return null;

  const [hero, ...rest] = posts;

  return (
    <section className="border-b border-neutral-200">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          <ArticleCard post={hero} variant="hero" />
          <div className="flex flex-col gap-0 lg:col-span-1">
            {rest.slice(0, 4).map((post) => (
              <ArticleCard key={post.id} post={post} variant="horizontal" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BookShopStrip({ lang }: { lang: "en" | "th" }) {
  return (
    <section className="border-b border-neutral-200 bg-neutral-950 text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-400">
            {lang === "th" ? "ร้านหนังสือ" : "Book Shop"}
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl">
            {lang === "th" ? "หนังสือและสิ่งพิมพ์จาก art4d" : "Books & publications from art4d"}
          </h2>
        </div>
        <Link
          href={lang === "th" ? "/shop?lang=th" : "/shop"}
          className="border border-white px-6 py-3 text-xs font-medium uppercase tracking-widest hover:bg-white hover:text-black"
        >
          {lang === "th" ? "ไปที่ร้านค้า" : "Visit shop"}
        </Link>
      </div>
    </section>
  );
}

/** Simple horizontal scroll carousel for highlight stories */
export function StoryCarousel({ posts, lang }: { posts: WPPost[]; lang: "en" | "th" }) {
  if (!posts.length) return null;

  return (
    <section className="overflow-hidden border-b border-neutral-200">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <p className="mb-6 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
          {lang === "th" ? "ไฮไลท์" : "Highlight"}
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide sm:gap-6">
          {posts.map((post) => {
            const img = post.featured_image_src;
            const title = decodeHtmlEntities(stripHtml(post.title.rendered));
            return (
              <Link
                key={post.id}
                href={getPostHref(post)}
                className="group w-[280px] flex-shrink-0 snap-start sm:w-[320px]"
              >
                {img && (
                  <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                    <Image
                      src={img}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="320px"
                    />
                  </div>
                )}
                <h3 className="mt-3 font-display text-lg leading-snug group-hover:underline">
                  {title}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
