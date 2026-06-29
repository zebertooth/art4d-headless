import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CartView } from "@/components/shop/CartView";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { WPLanguage } from "@/lib/types";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  return buildPageMetadata({
    title: lang === "th" ? "ตะกร้าสินค้า" : "Cart",
    path: lang === "th" ? "/th/shop/cart" : "/shop/cart",
    lang,
    robots: { index: false, follow: false },
  });
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <SectionHeading
          title={lang === "th" ? "ตะกร้าสินค้า" : "Cart"}
          lang={lang}
        />
        <div className="mt-8">
          <CartView lang={lang} />
        </div>
      </div>
    </SiteLayout>
  );
}
