import Link from "next/link";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

function pageHref(basePath: string, page: number, lang: WPLanguage): string {
  const path = page <= 1 ? basePath : `${basePath}?page=${page}`;
  return hrefWithLang(path, lang);
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  lang,
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  lang: WPLanguage;
}) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(currentPage, totalPages);

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2 border-t border-neutral-200 pt-8"
      aria-label={lang === "th" ? "การแบ่งหน้า" : "Pagination"}
    >
      {currentPage > 1 ? (
        <PaginationLink
          href={pageHref(basePath, currentPage - 1, lang)}
          label={lang === "th" ? "ก่อนหน้า" : "Previous"}
        />
      ) : (
        <span className="px-3 py-2 text-sm text-neutral-300">
          {lang === "th" ? "ก่อนหน้า" : "Previous"}
        </span>
      )}

      {pages.map((page, index) =>
        page === "…" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={pageHref(basePath, page, lang)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`min-w-10 px-3 py-2 text-center text-sm ${
              page === currentPage
                ? "bg-black text-white"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <PaginationLink
          href={pageHref(basePath, currentPage + 1, lang)}
          label={lang === "th" ? "ถัดไป" : "Next"}
        />
      ) : (
        <span className="px-3 py-2 text-sm text-neutral-300">
          {lang === "th" ? "ถัดไป" : "Next"}
        </span>
      )}
    </nav>
  );
}

function PaginationLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 text-sm font-medium uppercase tracking-widest text-neutral-600 hover:text-black"
    >
      {label}
    </Link>
  );
}

function buildPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
