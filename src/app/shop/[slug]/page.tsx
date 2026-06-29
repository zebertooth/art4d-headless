import Image from "next/image";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ads/AdSlot";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { hrefWithLang } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getProductBySlug } from "@/lib/store-api";
import {
  formatStorePrice,
  stripProductHtml,
} from "@/lib/store-types";
import type { WPLanguage } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

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
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };

  return buildPageMetadata({
    title: stripProductHtml(product.name),
    path: lang === "th" ? `/th/shop/${slug}` : `/shop/${slug}`,
    lang,
    image: product.images[0]?.src,
  });
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = formatStorePrice(product.prices.price, product.prices);
  const image = product.images[0];

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <Link
          href={hrefWithLang("/shop", lang)}
          className="text-[11px] font-medium uppercase tracking-widest text-neutral-500 hover:text-black"
        >
          ← {lang === "th" ? "ร้านค้า" : "Shop"}
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {image && (
            <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
              <Image
                src={image.src}
                alt={image.alt || product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}

          <div>
            {product.categories[0] && (
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
                {product.categories[0].name}
              </p>
            )}
            <h1 className="mt-3 font-display text-4xl leading-tight text-black">
              {stripProductHtml(product.name)}
            </h1>
            <p className="mt-4 text-2xl font-medium">{price}</p>

            {product.is_in_stock ? (
              <div className="mt-8">
                <AddToCartButton productId={product.id} lang={lang} />
              </div>
            ) : (
              <p className="mt-8 text-neutral-500">
                {lang === "th" ? "สินค้าหมด" : "Out of stock"}
              </p>
            )}

            {product.short_description && (
              <div
                className="prose prose-sm mt-10 max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}
          </div>
        </div>

        {product.description && (
          <div
            className="prose mx-auto mt-16 max-w-3xl text-neutral-800"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}

        <div className="mt-16">
          <AdSlot id="product-footer" size="leaderboard" />
        </div>
      </div>
    </SiteLayout>
  );
}
