import Link from "next/link";
import { AdSlot } from "@/components/ads/AdSlot";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

const sections: Record<string, { title: Record<WPLanguage, string>; body: Record<WPLanguage, string> }> = {
  "": {
    title: { en: "Event & Competition", th: "งานและประกวด" },
    body: {
      en: "Competitions, exhibitions and design events across architecture and design.",
      th: "การประกวด นิทรรศการ และงานออกแบบด้านสถาปัตยกรรมและการออกแบบ",
    },
  },
  competition: {
    title: { en: "Competition", th: "ประกวด" },
    body: { en: "Open calls and design competitions.", th: "ประกาศรับสมัครและการประกวดออกแบบ" },
  },
  event: {
    title: { en: "Event", th: "งาน" },
    body: { en: "Exhibitions, talks and openings.", th: "นิทรรศการ การบรรยาย และงานเปิดตัว" },
  },
  submit: {
    title: { en: "Submit your work", th: "ส่งผลงาน" },
    body: {
      en: "Share your project with the art4d editorial team.",
      th: "ส่งผลงานของคุณถึงทีมบรรณาธิการ art4d",
    },
  },
};

export default async function EventsPage({
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
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <SectionHeading title={page.title[lang]} lang={lang} />
        <p className="mt-8 text-lg text-neutral-600">{page.body[lang]}</p>
        <AdSlot id="events-banner" size="leaderboard" className="my-10" />
        <nav className="flex flex-wrap gap-4 text-sm">
          {Object.keys(sections).map((k) => (
            <Link
              key={k}
              href={hrefWithLang(k ? `/events/${k}` : "/events", lang)}
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
