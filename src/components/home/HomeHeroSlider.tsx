"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { HeroOverlay } from "@/lib/home-hero";

export type HeroSlide = {
  id: number;
  href: string;
  image: string;
  title: string;
  overlay?: HeroOverlay;
};

export function HomeHeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback(
    (next: number) => {
      if (!count) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    const timer = window.setInterval(() => go(index + 1), 6000);
    return () => window.clearInterval(timer);
  }, [count, go, index]);

  if (!count) return null;

  const slide = slides[index];

  return (
    <section className="border-b border-neutral-200 bg-black">
      <div className="relative mx-auto aspect-[16/9] max-h-[min(72vh,720px)] w-full max-w-[1400px] overflow-hidden sm:aspect-[21/9]">
        {slides.map((s, i) => (
          <Link
            key={s.id}
            href={s.href}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {s.overlay?.badge && (
              <span className="absolute right-6 top-6 z-20 flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white sm:right-10 sm:top-10 sm:h-28 sm:w-28 sm:text-xs">
                {s.overlay.badge}
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-10 sm:px-10 sm:pb-14">
              <h2 className="max-w-3xl font-display text-2xl leading-tight text-white sm:text-3xl lg:text-4xl">
                {s.title}
              </h2>
              {s.overlay?.subtitle && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                  {s.overlay.subtitle}
                </p>
              )}
            </div>
          </Link>
        ))}

        {count > 1 && (
          <div
            className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-2"
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}: ${s.title}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full border border-white transition-colors ${
                  i === index ? "bg-white" : "bg-transparent hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
