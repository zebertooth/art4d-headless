import { SiteLayout } from "@/components/layout/SiteLayout";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { WPLanguage } from "@/lib/types";

const titles: Record<string, Record<WPLanguage, string>> = {
  privacy: { en: "Privacy Policy", th: "นโยบายความเป็นส่วนตัว" },
  terms: { en: "Terms & Conditions", th: "ข้อกำหนดและเงื่อนไข" },
  cookies: { en: "Cookie Policy", th: "นโยบายคุกกี้" },
};

export default async function LegalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const title = titles[slug]?.[lang] ?? slug;

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SectionHeading title={title} lang={lang} />
        <p className="mt-8 text-neutral-600">
          {lang === "th"
            ? "เนื้อหานโยบายจะเชื่อมจาก WordPress หรือ CMS ในเฟสถัดไป"
            : "Policy content will be synced from WordPress or CMS in a later phase."}
        </p>
      </div>
    </SiteLayout>
  );
}
