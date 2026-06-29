"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { hrefWithLang } from "@/lib/navigation";
import type { WPLanguage } from "@/lib/types";

export function SearchForm({
  lang,
  defaultQuery = "",
}: {
  lang: WPLanguage;
  defaultQuery?: string;
}) {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const query = new FormData(form).get("q")?.toString().trim();
    if (!query) return;

    const path = `/search?q=${encodeURIComponent(query)}`;
    router.push(hrefWithLang(path, lang));
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2" role="search">
      <label htmlFor="site-search" className="sr-only">
        {lang === "th" ? "ค้นหา" : "Search"}
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        defaultValue={defaultQuery}
        placeholder={lang === "th" ? "ค้นหา…" : "Search…"}
        className="w-28 border-b border-neutral-300 bg-transparent py-1 text-xs outline-none placeholder:text-neutral-400 focus:border-black sm:w-40"
      />
      <button
        type="submit"
        className="text-[10px] font-medium uppercase tracking-widest text-neutral-500 hover:text-black"
      >
        {lang === "th" ? "ค้นหา" : "Go"}
      </button>
    </form>
  );
}
