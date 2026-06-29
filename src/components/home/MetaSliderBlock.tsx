import { AdSlot } from "@/components/ads/AdSlot";
import { PromoCarousel } from "@/components/home/PromoCarousel";
import {
  getMetaSlideshow,
  metaSlidesToCarousel,
  type MetaSlideshow,
} from "@/lib/metaslider";

export async function MetaSliderBlock({
  slideshowId,
  variant = "banner",
  fallbackAdId,
  label,
}: {
  slideshowId: number;
  variant?: "hero" | "banner";
  fallbackAdId?: string;
  label?: string;
}) {
  const slideshow = await getMetaSlideshow(slideshowId);

  if (slideshow?.slides.length) {
    return (
      <PromoCarousel
        slides={metaSlidesToCarousel(slideshow)}
        variant={variant}
        aspectWidth={slideshow.width}
        aspectHeight={slideshow.height}
        label={label ?? slideshow.label}
        showCaption={variant === "hero"}
      />
    );
  }

  if (fallbackAdId) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
        <AdSlot
          id={fallbackAdId}
          size={variant === "hero" ? "billboard" : "leaderboard"}
        />
      </div>
    );
  }

  return null;
}

export function metaBannerFromSlideshow(
  slideshow: MetaSlideshow,
  className = "",
) {
  if (!slideshow.slides.length) return null;

  return (
    <div className={className}>
      <PromoCarousel
        slides={metaSlidesToCarousel(slideshow)}
        variant="banner"
        aspectWidth={slideshow.width}
        aspectHeight={slideshow.height}
        label={slideshow.label}
      />
    </div>
  );
}

/** Pre-fetched banner row: Meta Slider carousel or AdSlot fallback. */
export function HomepageBannerRow({
  slideshow,
  fallbackAdId,
  adSize = "leaderboard",
  padding = "py-8",
}: {
  slideshow: MetaSlideshow | null | undefined;
  fallbackAdId: string;
  adSize?: "billboard" | "leaderboard" | "medium-rectangle";
  padding?: string;
}) {
  if (slideshow?.slides.length) {
    return (
      <div className={`mx-auto max-w-[1400px] px-4 sm:px-6 ${padding}`}>
        <PromoCarousel
          slides={metaSlidesToCarousel(slideshow)}
          variant="banner"
          aspectWidth={slideshow.width}
          aspectHeight={slideshow.height}
          label={slideshow.label}
        />
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-[1400px] px-4 sm:px-6 ${padding}`}>
      <AdSlot id={fallbackAdId} size={adSize} className={adSize === "medium-rectangle" ? "max-w-[336px] mx-auto" : undefined} />
    </div>
  );
}
