import Link from "next/link";
import Image from "next/image";
import { footerNav, hrefWithLang, t } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

const social = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

export function SiteFooter({ lang }: { lang: WPLanguage }) {
  return (
    <footer className="mt-16 border-t border-black bg-black text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href={hrefWithLang("/", lang)}>
              <Image
                src="/logo.png"
                alt="art4d"
                width={160}
                height={44}
                className="h-9 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-neutral-400">
              {lang === "th"
                ? "นิตยสารสถาปัตยกรรม การออกแบบ และศิลปะ"
                : "Architecture, design and art magazine from Thailand."}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
              {lang === "th" ? "ลิงก์" : "Links"}
            </p>
            <ul className="mt-4 space-y-2">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={hrefWithLang(item.href, lang)}
                    className="text-sm text-neutral-300 hover:text-white"
                  >
                    {t(item, lang)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
              {lang === "th" ? "โซเชียลมีเดีย" : "Social Media"}
            </p>
            <ul className="mt-4 space-y-2">
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-300 hover:text-white"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-500">
              {lang === "th" ? "จดหมายข่าว" : "Newsletter"}
            </p>
            <p className="mt-4 text-sm text-neutral-400">
              {lang === "th"
                ? "รับบทความล่าสุดทางอีเมล"
                : "Get the latest stories in your inbox."}
            </p>
            <Link
              href={hrefWithLang("/contact/newsletter", lang)}
              className="mt-4 inline-block border border-white px-4 py-2 text-xs font-medium uppercase tracking-widest hover:bg-white hover:text-black"
            >
              {lang === "th" ? "สมัคร" : "Subscribe"}
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} art4d. {lang === "th" ? "สงวนลิขสิทธิ์" : "All rights reserved."}
        </div>
      </div>
    </footer>
  );
}
