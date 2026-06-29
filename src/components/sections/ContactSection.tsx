import { SiteLayout } from "@/components/layout/SiteLayout";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ lang?: string }>;
};

const pages: Record<
  string,
  { title: Record<WPLanguage, string>; body: Record<WPLanguage, string> }
> = {
  "": {
    title: { en: "Contact Us", th: "ติดต่อเรา" },
    body: {
      en: "Get in touch with the art4d editorial team.",
      th: "ติดต่อทีมบรรณาธิการ art4d",
    },
  },
  about: {
    title: { en: "About Us", th: "เกี่ยวกับเรา" },
    body: {
      en: "art4d is Thailand's leading architecture, design and art magazine.",
      th: "art4d คือนิตยสารสถาปัตยกรรม การออกแบบ และศิลปะชั้นนำของไทย",
    },
  },
  advertise: {
    title: { en: "Advertise", th: "ลงโฆษณา" },
    body: {
      en: "Reach architects, designers and creative professionals. Banner positions available on homepage and category pages.",
      th: "เข้าถึงสถาปนิก นักออกแบบ และผู้เชี่ยวชาญด้านสร้างสรรค์ มีตำแหน่งโฆษณาบนหน้าแรกและหมวดหมู่",
    },
  },
  newsletter: {
    title: { en: "Newsletter", th: "จดหมายข่าว" },
    body: {
      en: "Subscribe to receive our latest stories and events.",
      th: "สมัครรับบทความและกิจกรรมล่าสุด",
    },
  },
};

export function ContactSection({
  segment,
  searchParams,
}: {
  segment: string;
  searchParams: Promise<{ lang?: string }>;
}) {
  return (
    <ContactSectionInner segment={segment} searchParams={searchParams} />
  );
}

async function ContactSectionInner({
  segment,
  searchParams,
}: {
  segment: string;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const page = pages[segment] ?? pages[""];

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SectionHeading title={page.title[lang]} lang={lang} />
        <p className="mt-8 text-lg leading-relaxed text-neutral-600">
          {page.body[lang]}
        </p>

        {segment === "newsletter" && (
          <form className="mt-10 flex flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder={lang === "th" ? "อีเมลของคุณ" : "Your email"}
              className="flex-1 border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
            />
            <button
              type="button"
              className="bg-black px-8 py-3 text-xs font-medium uppercase tracking-widest text-white hover:bg-neutral-800"
            >
              {lang === "th" ? "สมัคร" : "Subscribe"}
            </button>
          </form>
        )}

        {segment === "" && (
          <form className="mt-10 space-y-4">
            {["Name", "Email", "Message"].map((field) => (
              <div key={field}>
                <label className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                  {field}
                </label>
                {field === "Message" ? (
                  <textarea
                    rows={5}
                    className="mt-1 w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                ) : (
                  <input
                    type={field === "Email" ? "email" : "text"}
                    className="mt-1 w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              className="bg-black px-8 py-3 text-xs font-medium uppercase tracking-widest text-white"
            >
              {lang === "th" ? "ส่ง" : "Send"}
            </button>
          </form>
        )}

        <nav className="mt-12 flex flex-wrap gap-4 border-t border-neutral-200 pt-8 text-sm">
          {Object.keys(pages).map((key) => (
            <Link
              key={key}
              href={hrefWithLang(key ? `/contact/${key}` : "/contact", lang)}
              className="text-neutral-500 hover:text-black"
            >
              {pages[key].title[lang]}
            </Link>
          ))}
        </nav>
      </div>
    </SiteLayout>
  );
}
