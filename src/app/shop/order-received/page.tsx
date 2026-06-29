import Link from "next/link";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { hrefWithLang } from "@/lib/navigation";
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
    title: lang === "th" ? "ขอบคุณสำหรับคำสั่งซื้อ" : "Order received",
    path: lang === "th" ? "/th/shop/order-received" : "/shop/order-received",
    lang,
    robots: { index: false, follow: false },
  });
}

export default async function OrderReceivedPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; order_id?: string; key?: string }>;
}) {
  const { lang: langParam, order_id, key } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <SectionHeading
          title={lang === "th" ? "ขอบคุณสำหรับคำสั่งซื้อ" : "Thank you for your order"}
          lang={lang}
        />
        <p className="mt-6 text-neutral-600">
          {lang === "th"
            ? "คำสั่งซื้อของคุณได้รับการยืนยันแล้ว"
            : "Your order has been received."}
        </p>
        {order_id && (
          <p className="mt-2 text-sm text-neutral-500">
            {lang === "th" ? "หมายเลขคำสั่งซื้อ" : "Order"} #{order_id}
          </p>
        )}
        {key && (
          <p className="mt-1 text-xs text-neutral-400">
            {lang === "th"
              ? "ลิงก์ดาวน์โหลดจะถูกส่งทางอีเมล (สำหรับสินค้าดิจิทัล)"
              : "Download links will be emailed for digital products."}
          </p>
        )}
        <Link
          href={hrefWithLang("/shop", lang)}
          className="mt-10 inline-block border border-black px-8 py-3 text-xs font-medium uppercase tracking-widest hover:bg-black hover:text-white"
        >
          {lang === "th" ? "กลับไปร้านค้า" : "Back to shop"}
        </Link>
      </div>
    </SiteLayout>
  );
}
