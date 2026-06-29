import Link from "next/link";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

const sections: Record<string, { title: Record<WPLanguage, string>; body: Record<WPLanguage, string> }> = {
  "": {
    title: { en: "Submission & Press", th: "ส่งข่าวและสื่อ" },
    body: {
      en: "Press releases and editorial submissions.",
      th: "ข่าวประชาสัมพันธ์และการส่งบทความ",
    },
  },
  login: {
    title: { en: "Login", th: "เข้าสู่ระบบ" },
    body: { en: "Contributor login — coming soon.", th: "เข้าสู่ระบบผู้ส่งบทความ — เร็วๆ นี้" },
  },
  contact: {
    title: { en: "Contact Form", th: "แบบฟอร์มติดต่อ" },
    body: { en: "Contact the press desk.", th: "ติดต่อฝ่ายสื่อ" },
  },
};

export default async function SubmissionPage({
  params,
  searchParams,
}: {
  params: Promise<{ segment?: string[] }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const segments = (await params).segment;
  const key = segments?.[0] ?? "";
  const { lang: langParam } = await searchParams;
  const lang: WPLanguage = langParam === "th" ? "th" : "en";
  const page = sections[key] ?? sections[""];

  return (
    <SiteLayout lang={lang}>
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <SectionHeading title={page.title[lang]} lang={lang} />
        <p className="mt-8 text-neutral-600">{page.body[lang]}</p>
        {key === "login" && (
          <form className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-neutral-300 px-4 py-3 text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border border-neutral-300 px-4 py-3 text-sm"
            />
            <button
              type="button"
              className="w-full bg-black py-3 text-xs font-medium uppercase tracking-widest text-white"
            >
              Login
            </button>
          </form>
        )}
        <nav className="mt-10 flex gap-4 text-sm">
          {Object.keys(sections).map((k) => (
            <Link
              key={k}
              href={hrefWithLang(k ? `/submission/${k}` : "/submission", lang)}
              className="text-neutral-500 hover:text-black"
            >
              {sections[k].title[lang]}
            </Link>
          ))}
        </nav>
      </div>
    </SiteLayout>
  );
}
