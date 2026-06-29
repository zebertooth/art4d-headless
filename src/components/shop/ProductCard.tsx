import Image from "next/image";
import Link from "next/link";
import { hrefWithLang } from "@/lib/navigation";
import {
  formatStorePrice,
  stripProductHtml,
  type WCStoreProduct,
} from "@/lib/store-types";
import type { WPLanguage } from "@/lib/types";

export function ProductCard({
  product,
  lang,
}: {
  product: WCStoreProduct;
  lang: WPLanguage;
}) {
  const image = product.images[0];
  const price = formatStorePrice(product.prices.price, product.prices);
  const category = product.categories[0]?.name;

  return (
    <article className="group flex flex-col">
      <Link
        href={hrefWithLang(`/shop/${product.slug}`, lang)}
        className="block overflow-hidden bg-neutral-100"
      >
        {image ? (
          <div className="relative aspect-[3/4] w-full">
            <Image
              src={image.src}
              alt={image.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center text-neutral-300">
            art4d
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        {category && (
          <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
            {category}
          </p>
        )}
        <h3 className="text-card-title mt-2 text-black">
          <Link
            href={hrefWithLang(`/shop/${product.slug}`, lang)}
            className="hover:underline"
          >
            {stripProductHtml(product.name)}
          </Link>
        </h3>
        <p className="mt-auto pt-3 text-[12pt] font-medium text-black">{price}</p>
      </div>
    </article>
  );
}
