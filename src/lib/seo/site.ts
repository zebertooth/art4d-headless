export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return url;
}

export const SITE_NAME = "art4d";

export const DEFAULT_DESCRIPTION = {
  en: "Architecture, design and art magazine from Thailand. ARCHITECTURE | DESIGN | ART",
  th: "นิตยสารสถาปัตยกรรม การออกแบบ และศิลปะจากประเทศไทย",
} as const;

export const OG_IMAGE = "/apple-touch-icon.png";

export const PUBLISHER_LOGO = "/logo.png";
