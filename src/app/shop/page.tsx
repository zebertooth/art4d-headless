import { AdSlot } from "@/components/ads/AdSlot";
import { Pagination } from "@/components/layout/Pagination";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopBanner } from "@/components/shop/ShopBanner";
import { hrefWithLang } from "@/lib/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getProducts } from "@/lib/store-api";
import type { WPLanguage } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

const PER_PAGE = 12;

const SHOP_CATEGORIES = [
  { slug: "", label: { en: "All", th: "ทั้งหมด" } },
  { slug: "art4d-magazine", label: { en: "Magazine", th: "นิตยสาร" } },
  { slug: "books", label: { en: "Books", th: "หนังสือ" } },
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  return buildPageMetadata({
    title: lang === "th" ? "ร้านค้า" : "Shop",
    description:
      lang === "th"
        ? "หนังสือและนิตยสาร art4d"
        : "art4d magazines and books — digital downloads and shipping.",
    path: lang === "th" ? "/th/shop" : "/shop",
    lang,
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; category?: string; page?: string }>;
}) {
  const { lang: langParam, category, page: pageParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const { products, totalPages } = await getProducts({
    page: currentPage,
    perPage: PER_PAGE,
    category: category || undefined,
  });

  const basePath = category ? `/shop?category=${category}` : "/shop";
  const queryParams = category ? { category } : undefined;

  return (
    <SiteLayout lang={lang}>
      <ShopBanner lang={lang} />
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading
          title={lang === "th" ? "ร้านค้า" : "Shop"}
          lang={lang}
          subtitle={
            lang === "th"
              ? "นิตยสาร หนังสือ และดาวน์โหลดดิจิทัล"
              : "Magazines, books & digital downloads"
          }
        />

        <nav className="mt-6 flex flex-wrap gap-4 border-b border-neutral-200 pb-4 text-sm">
          {SHOP_CATEGORIES.map((cat) => {
            const href = cat.slug
              ? `/shop?category=${cat.slug}`
              : "/shop";
            const active = (category ?? "") === cat.slug;
            return (
              <Link
                key={cat.slug || "all"}
                href={hrefWithLang(href, lang)}
                className={
                  active
                    ? "font-medium text-black underline underline-offset-4"
                    : "text-neutral-500 hover:text-black"
                }
              >
                {cat.label[lang]}
              </Link>
            );
          })}
        </nav>

        <AdSlot id="shop-highlight" size="billboard" className="my-10" />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} lang={lang} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="py-12 text-center text-neutral-500">
            {lang === "th" ? "ไม่พบสินค้า" : "No products found."}
          </p>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={basePath}
          lang={lang}
          queryParams={queryParams}
        />
      </div>
    </SiteLayout>
  );
}
