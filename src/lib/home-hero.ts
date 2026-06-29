/**
 * Homepage hero overlays — edit here until a WordPress hero CMS is wired.
 * Slides are pulled from latest posts with featured images; overlays match by index.
 */
export type HeroOverlay = {
  badge?: string;
  subtitle?: string;
};

export const heroOverlays: HeroOverlay[] = [
  { badge: "art4d 289 OUT NOW", subtitle: "Thinkk Again" },
];
