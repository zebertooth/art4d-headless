/**
 * Meta Slider (ml-slider) import from art4d.com rendered HTML.
 * The plugin REST API requires WP login — public HTML is the read-only source.
 */

export type MetaSlide = {
  id: string;
  href: string;
  image: string;
  title: string;
};

export type MetaSlideshow = {
  id: number;
  label: string;
  width: number;
  height: number;
  slides: MetaSlide[];
};

const SOURCE_URL =
  process.env.METASLIDER_SOURCE_URL ?? "https://art4d.com/";

/** Known slideshow IDs on art4d.com homepage (from ml-slider widgets). */
export const HOME_SLIDESHOW = {
  bannerTop: Number(process.env.METASLIDER_BANNER_TOP_ID ?? 41249),
  hero: Number(process.env.METASLIDER_HERO_ID ?? 57),
  banners: (process.env.METASLIDER_BANNER_IDS ?? "121869,126381,120432,122328")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter(Boolean),
} as const;

let htmlCache: { html: string; fetchedAt: number } | null = null;
const CACHE_MS = 60_000;

async function fetchSourceHtml(): Promise<string> {
  const now = Date.now();
  if (htmlCache && now - htmlCache.fetchedAt < CACHE_MS) {
    return htmlCache.html;
  }

  const res = await fetch(SOURCE_URL, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Meta Slider source fetch failed: ${res.status}`);
  }

  const html = await res.text();
  htmlCache = { html, fetchedAt: now };
  return html;
}

export function parseSlideshowFromHtml(
  html: string,
  slideshowId: number,
): MetaSlideshow | null {
  const meta = html.match(
    new RegExp(
      `metaslider-${slideshowId}[^"]*"[^>]*aria-label="([^"]*)"[^>]*data-height="(\\d+)"[^>]*data-width="(\\d+)"`,
    ),
  );
  if (!meta) return null;

  const marker = `metaslider_container_${slideshowId}`;
  const start = html.indexOf(marker);
  if (start === -1) {
    return {
      id: slideshowId,
      label: meta[1],
      width: Number(meta[3]),
      height: Number(meta[2]),
      slides: [],
    };
  }

  const asideEnd = html.indexOf("</aside>", start);
  const block = html.slice(
    start,
    asideEnd === -1 ? start + 30_000 : asideEnd,
  );

  const slides: MetaSlide[] = [];
  const seen = new Set<string>();
  const slideRe = new RegExp(
    `<a\\s+[^>]*href="([^"]*)"[^>]*>\\s*<img([^>]*class="slider-${slideshowId} slide-(\\d+)[^"]*"[^>]*)>`,
    "g",
  );
  let match: RegExpExecArray | null;

  while ((match = slideRe.exec(block)) !== null) {
    if (seen.has(match[3])) continue;
    seen.add(match[3]);

    const imgAttrs = match[2];
    const image = imgAttrs.match(/src="([^"]+)"/)?.[1];
    if (!image) continue;

    slides.push({
      id: match[3],
      href: match[1],
      image,
      title: decodeHtml(imgAttrs.match(/title="([^"]*)"/)?.[1] || ""),
    });
  }

  return {
    id: slideshowId,
    label: meta[1],
    width: Number(meta[3]),
    height: Number(meta[2]),
    slides,
  };
}

function decodeHtml(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

export async function getMetaSlideshow(
  slideshowId: number,
): Promise<MetaSlideshow | null> {
  try {
    const html = await fetchSourceHtml();
    return parseSlideshowFromHtml(html, slideshowId);
  } catch {
    return null;
  }
}

export async function getHomepageSlideshows(): Promise<{
  bannerTop: MetaSlideshow | null;
  hero: MetaSlideshow | null;
  banners: MetaSlideshow[];
}> {
  try {
    const html = await fetchSourceHtml();
    const bannerTop = parseSlideshowFromHtml(html, HOME_SLIDESHOW.bannerTop);
    const hero = parseSlideshowFromHtml(html, HOME_SLIDESHOW.hero);
    const banners = HOME_SLIDESHOW.banners
      .map((id) => parseSlideshowFromHtml(html, id))
      .filter((s): s is MetaSlideshow => s !== null && s.slides.length > 0);

    return { bannerTop, hero, banners };
  } catch {
    return { bannerTop: null, hero: null, banners: [] };
  }
}

export function metaSlidesToCarousel(
  slideshow: MetaSlideshow,
): Array<{
  id: string;
  href: string;
  image: string;
  title: string;
}> {
  return slideshow.slides.map((s) => ({
    id: s.id,
    href: s.href,
    image: s.image,
    title: s.title,
  }));
}
