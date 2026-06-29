"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { SearchForm } from "@/components/layout/SearchForm";
import { CartLink } from "@/components/shop/CartLink";
import { hrefWithLang, mainNav, t } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

export function SiteHeader({ lang }: { lang: WPLanguage }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const otherLang = lang === "en" ? "th" : "en";

  return (
    <header className="sticky top-0 z-50 border-b border-black bg-white">
      {/* Top bar */}
      <div className="border-b border-neutral-100">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-2 text-[11px] uppercase tracking-widest text-neutral-500 sm:px-6">
          <span>{lang === "th" ? "นิตยสารสถาปัตยกรรมและการออกแบบ" : "Architecture & Design Magazine"}</span>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <SearchForm lang={lang} />
            </div>
            <CartLink lang={lang} />
            <Link href={hrefWithLang("/contact/newsletter", lang)} className="hover:text-black">
              {lang === "th" ? "จดหมายข่าว" : "Newsletter"}
            </Link>
            <Link
              href={lang === "en" ? "/th" : "/"}
              className="font-semibold text-black"
            >
              {otherLang.toUpperCase()}
            </Link>
          </div>
        </div>
      </div>

      {/* Logo + primary nav */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex items-center justify-between py-4">
          <Logo lang={lang} />

          <button
            type="button"
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <span className={`block h-px w-6 bg-black transition ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-px w-6 bg-black transition ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-px w-6 bg-black transition ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href={hrefWithLang("/", lang)}
              className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-black hover:bg-neutral-50"
            >
              {lang === "th" ? "หน้าแรก" : "Home"}
            </Link>
            {mainNav.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => setOpenMenu(item.href)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={hrefWithLang(item.href, lang)}
                  className="px-3 py-2 text-xs font-medium uppercase tracking-widest text-neutral-700 hover:text-black"
                >
                  {t(item, lang)}
                </Link>
                {item.children && openMenu === item.href && (
                  <div className="absolute left-0 top-full min-w-[220px] border border-neutral-200 bg-white py-2 shadow-lg">
                    {item.children.map((child) => (
                      <div key={child.href}>
                        <Link
                          href={hrefWithLang(child.href, lang)}
                          className="block px-4 py-2 text-xs uppercase tracking-wider text-neutral-700 hover:bg-neutral-50 hover:text-black"
                        >
                          {t(child, lang)}
                        </Link>
                        {child.children?.map((sub) => (
                          <Link
                            key={sub.href}
                            href={hrefWithLang(sub.href, lang)}
                            className="block py-1.5 pl-8 pr-4 text-[11px] text-neutral-500 hover:text-black"
                          >
                            {t(sub, lang)}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-neutral-200 bg-white px-4 py-4 lg:hidden">
          <div className="mb-4">
            <SearchForm lang={lang} />
          </div>
          <Link
            href={hrefWithLang("/", lang)}
            className="block py-2 text-sm font-medium uppercase tracking-widest"
            onClick={() => setMobileOpen(false)}
          >
            {lang === "th" ? "หน้าแรก" : "Home"}
          </Link>
          {mainNav.map((item) => (
            <div key={item.href} className="border-t border-neutral-100 py-2">
              <Link
                href={hrefWithLang(item.href, lang)}
                className="block py-1 text-sm font-medium uppercase tracking-widest"
                onClick={() => setMobileOpen(false)}
              >
                {t(item, lang)}
              </Link>
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={hrefWithLang(child.href, lang)}
                  className="block py-1 pl-4 text-xs text-neutral-600"
                  onClick={() => setMobileOpen(false)}
                >
                  {t(child, lang)}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
