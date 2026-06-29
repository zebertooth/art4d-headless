import Link from "next/link";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

export function SectionHeading({
  title,
  href,
  lang,
  subtitle,
}: {
  title: string;
  href?: string;
  lang: WPLanguage;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between border-b border-black pb-3">
      <div>
        {subtitle && (
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
            {subtitle}
          </p>
        )}
        {href ? (
          <Link
            href={hrefWithLang(href, lang)}
            className="text-section-title font-normal tracking-tight text-black hover:opacity-70"
          >
            {title}
          </Link>
        ) : (
          <h2 className="text-section-title font-normal tracking-tight text-black">
            {title}
          </h2>
        )}
      </div>
      {href && (
        <Link
          href={hrefWithLang(href, lang)}
          className="hidden text-[10pt] font-medium uppercase tracking-widest text-neutral-500 hover:text-black sm:block"
        >
          {lang === "th" ? "ดูทั้งหมด" : "View all"}
        </Link>
      )}
    </div>
  );
}
