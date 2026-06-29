import Image from "next/image";
import Link from "next/link";
import type { WPPost } from "@/lib/types";
import {
  decodeHtmlEntities,
  formatPostDate,
  getFeaturedImage,
  getPostHref,
  getPrimaryCategory,
  stripHtml,
} from "@/lib/utils";

type Variant = "default" | "compact" | "hero" | "horizontal";

export function ArticleCard({
  post,
  variant = "default",
}: {
  post: WPPost;
  variant?: Variant;
}) {
  const image = getFeaturedImage(post);
  const lang = post.lang ?? "en";
  const title = decodeHtmlEntities(stripHtml(post.title.rendered));
  const excerpt = stripHtml(post.excerpt.rendered);
  const category = getPrimaryCategory(post);
  const href = getPostHref(post);

  if (variant === "hero") {
    return (
      <article className="group relative col-span-full lg:col-span-2">
        <Link href={href} className="block">
          {image && (
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 lg:aspect-[16/10]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                priority
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
          )}
          <div className="mt-5 max-w-2xl">
            {category && (
              <p className="text-meta-sm font-medium uppercase tracking-[0.3em] text-neutral-500">
                {category}
              </p>
            )}
            <h2 className="text-article-title mt-2 text-black">
              {title}
            </h2>
            {excerpt && (
              <p className="text-entry-summary mt-3 line-clamp-2 text-neutral-600">
                {excerpt}
              </p>
            )}
            <time className="text-meta mt-4 block text-neutral-400">
              {formatPostDate(post.date, lang)}
            </time>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === "horizontal") {
    return (
      <article className="group grid grid-cols-[120px_1fr] gap-4 border-b border-neutral-100 py-4 sm:grid-cols-[160px_1fr]">
        <Link href={href} className="relative aspect-square overflow-hidden bg-neutral-100">
          {image && (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="160px"
            />
          )}
        </Link>
        <div>
          {category && (
            <p className="text-meta-sm font-medium uppercase tracking-[0.25em] text-neutral-500">
              {category}
            </p>
          )}
          <h3 className="text-card-title mt-1 text-black group-hover:underline">
            <Link href={href}>{title}</Link>
          </h3>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className="group">
        <Link href={href}>
          {image && (
            <div className="relative aspect-[3/2] overflow-hidden bg-neutral-100">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          )}
          <h3 className="mt-3 text-[12pt] leading-[12pt] text-black group-hover:underline">
            {title}
          </h3>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col">
      <Link href={href} className="block overflow-hidden bg-neutral-100">
        {image ? (
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-neutral-300" />
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        {category && (
          <p className="text-meta-sm font-medium uppercase tracking-[0.3em] text-neutral-500">
            {category}
          </p>
        )}
        <h3 className="text-card-title mt-2 text-black">
          <Link href={href} className="hover:underline">
            {title}
          </Link>
        </h3>
        {excerpt && variant === "default" && (
          <p className="text-entry-summary mt-2 line-clamp-2 text-neutral-600">
            {excerpt}
          </p>
        )}
        <time className="text-date-sm mt-auto pt-3 text-neutral-400">
          {formatPostDate(post.date, lang)}
        </time>
      </div>
    </article>
  );
}
