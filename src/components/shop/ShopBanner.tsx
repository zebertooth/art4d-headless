import Image from "next/image";
import Link from "next/link";
import { hrefWithLang } from "@/lib/navigation";
import { getProducts } from "@/lib/store-api";
import { stripProductHtml } from "@/lib/store-types";
import type { WPLanguage } from "@/lib/types";

/** Product cover carousel — matches art4d.com/shop hero strip. */
export async function ShopBanner({ lang }: { lang: WPLanguage }) {
  const { products } = await getProducts({
    perPage: 8,
    category: "art4d-magazine",
  });

  const slides = products.filter((p) => p.images[0]);

  if (!slides.length) return null;

  return (
    <section className="border-b border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
          {lang === "th" ? "นิตยสาร art4d" : "art4d Magazine"}
        </p>
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
          {slides.map((product) => {
            const image = product.images[0];
            return (
              <Link
                key={product.id}
                href={hrefWithLang(`/shop/${product.slug}`, lang)}
                className="group relative h-[280px] w-[200px] shrink-0 overflow-hidden bg-white shadow-sm sm:h-[320px] sm:w-[220px]"
              >
                <Image
                  src={image.src}
                  alt={image.alt || stripProductHtml(product.name)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="220px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-xs font-medium text-white line-clamp-2">
                    {stripProductHtml(product.name)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
