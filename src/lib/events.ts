import type { WPLanguage } from "./types";

export type EventSectionKey = "" | "competition" | "event" | "submit";

export type EventSection = {
  title: Record<WPLanguage, string>;
  body: Record<WPLanguage, string>;
  /** WP category slug */
  categorySlug?: string;
  /** WP search query */
  searchQuery?: string;
};

/** Maps /events routes to WordPress content sources. */
export const eventSections: Record<EventSectionKey, EventSection> = {
  "": {
    title: { en: "Event & Competition", th: "งานและประกวด" },
    body: {
      en: "Competitions, exhibitions and design events across architecture and design.",
      th: "การประกวด นิทรรศการ และงานออกแบบด้านสถาปัตยกรรมและการออกแบบ",
    },
    categorySlug: "update",
  },
  competition: {
    title: { en: "Competition", th: "ประกวด" },
    body: {
      en: "Open calls and design competitions.",
      th: "ประกาศรับสมัครและการประกวดออกแบบ",
    },
    searchQuery: "competition",
  },
  event: {
    title: { en: "Event", th: "งาน" },
    body: {
      en: "Exhibitions, talks and openings.",
      th: "นิทรรศการ การบรรยาย และงานเปิดตัว",
    },
    searchQuery: "exhibition",
  },
  submit: {
    title: { en: "Submit your work", th: "ส่งผลงาน" },
    body: {
      en: "Share your project with the art4d editorial team.",
      th: "ส่งผลงานของคุณถึงทีมบรรณาธิการ art4d",
    },
  },
};

export const eventSectionKeys = Object.keys(eventSections) as EventSectionKey[];

export function resolveEventSectionKey(segment?: string): EventSectionKey {
  if (!segment) return "";
  return segment in eventSections ? (segment as EventSectionKey) : "";
}
