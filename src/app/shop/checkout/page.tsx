import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
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
    title: lang === "th" ? "ชำระเงิน" : "Checkout",
    path: lang === "th" ? "/th/shop/checkout" : "/shop/checkout",
    lang,
    robots: { index: false, follow: false },
  });
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <SectionHeading
          title={lang === "th" ? "ชำระเงิน" : "Checkout"}
          lang={lang}
        />
        <div className="mt-8">
          <CheckoutForm lang={lang} />
        </div>
      </div>
    </SiteLayout>
  );
}
