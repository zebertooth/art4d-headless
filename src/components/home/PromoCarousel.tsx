"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export type CarouselSlide = {
  id: string;
  href: string;
  image: string;
  title?: string;
  badge?: string;
  subtitle?: string;
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href) && !href.includes("art4d.com");
}

function SlideLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  tabIndex?: number;
  "aria-hidden"?: boolean;
}) {
  if (isExternal(href)) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  const path = href.replace(/^https?:\/\/art4d\.com/, "") || "/";
  return (
    <Link href={path} className={className} {...rest}>
      {children}
    </Link>
  );
}

/** Image carousel — hero (16:9) or wide banner (from art4d Meta Slider). */
export function PromoCarousel({
  slides,
  variant = "hero",
  aspectWidth,
  aspectHeight,
  label = "Carousel",
  autoPlayMs = 6000,
  showCaption = false,
}: {
  slides: CarouselSlide[];
  variant?: "hero" | "banner";
  aspectWidth?: number;
  aspectHeight?: number;
  label?: string;
  autoPlayMs?: number;
  showCaption?: boolean;
}) {
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
    if (count < 2 || autoPlayMs <= 0) return;
    const timer = window.setInterval(() => go(index + 1), autoPlayMs);
    return () => window.clearInterval(timer);
  }, [autoPlayMs, count, go, index]);

  if (!count) return null;

  const w = aspectWidth ?? (variant === "banner" ? 1200 : 16);
  const h = aspectHeight ?? (variant === "banner" ? 260 : 9);

  return (
    <section
      className={`border-b border-neutral-200 ${variant === "hero" ? "bg-black" : "bg-white"}`}
      aria-label={label}
    >
      <div
        className={`relative mx-auto w-full max-w-[1400px] overflow-hidden ${
          variant === "hero" ? "max-h-[min(72vh,720px)]" : ""
        }`}
        style={{ aspectRatio: `${w} / ${h}` }}
      >
        {slides.map((s, i) => (
          <SlideLink
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
              alt={s.title || label}
              fill
              priority={i === 0}
              className="object-cover"
              sizes="100vw"
            />

            {variant === "hero" && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            )}

            {s.badge && variant === "hero" && (
              <span className="absolute right-6 top-6 z-20 flex h-24 w-24 items-center justify-center rounded-full bg-red-600 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white sm:right-10 sm:top-10 sm:h-28 sm:w-28 sm:text-xs">
                {s.badge}
              </span>
            )}

            {showCaption && s.title && variant === "hero" && (
              <div className="absolute inset-x-0 bottom-0 z-20 px-6 pb-10 sm:px-10 sm:pb-14">
                <h2 className="max-w-3xl break-words font-display text-lg leading-tight text-white line-clamp-3 sm:text-2xl lg:text-3xl">
                  {s.title}
                </h2>
                {s.subtitle && (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                    {s.subtitle}
                  </p>
                )}
              </div>
            )}
          </SlideLink>
        ))}

        {count > 1 && (
          <div
            className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 gap-2"
            role="tablist"
            aria-label={`${label} pagination`}
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                  variant === "hero"
                    ? `border-white ${i === index ? "bg-white" : "bg-transparent hover:bg-white/60"}`
                    : `border-neutral-800 ${i === index ? "bg-neutral-800" : "bg-transparent hover:bg-neutral-400"}`
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
