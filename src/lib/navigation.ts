import type { WPLanguage } from "./types";

export type NavItem = {
  label: Record<WPLanguage, string>;
  href: string;
  children?: NavItem[];
};

/** Primary nav — matches sitemap wireframe */
export const mainNav: NavItem[] = [
  {
    label: { en: "Article", th: "บทความ" },
    href: "/category/architecture",
    children: [
      { label: { en: "Architecture", th: "สถาปัตยกรรม" }, href: "/category/architecture" },
      { label: { en: "Design", th: "การออกแบบ" }, href: "/category/design" },
      { label: { en: "Art", th: "ศิลปะ" }, href: "/category/art" },
      {
        label: { en: "Conversation", th: "บทสนทนา" },
        href: "/category/interview",
        children: [
          { label: { en: "People", th: "บุคคล" }, href: "/category/people" },
          { label: { en: "Interview", th: "สัมภาษณ์" }, href: "/category/interview" },
          { label: { en: "Bites", th: "Bites" }, href: "/category/bites" },
        ],
      },
      { label: { en: "Photo Essay", th: "ภาพเล่าเรื่อง" }, href: "/category/photo-essay" },
      { label: { en: "Book", th: "หนังสือ" }, href: "/category/book" },
      { label: { en: "Material & Innovation", th: "วัสดุและนวัตกรรม" }, href: "/category/material" },
    ],
  },
  {
    label: { en: "Event & Competition", th: "งานและประกวด" },
    href: "/events",
    children: [
      { label: { en: "Competition", th: "ประกวด" }, href: "/events/competition" },
      { label: { en: "Event", th: "งาน" }, href: "/events/event" },
      { label: { en: "Submit your work", th: "ส่งผลงาน" }, href: "/events/submit" },
    ],
  },
  {
    label: { en: "Submission & Press", th: "ส่งข่าวและสื่อ" },
    href: "/submission",
    children: [
      { label: { en: "Login", th: "เข้าสู่ระบบ" }, href: "/submission/login" },
      { label: { en: "Contact Form", th: "แบบฟอร์มติดต่อ" }, href: "/submission/contact" },
    ],
  },
  {
    label: { en: "Shop", th: "ร้านค้า" },
    href: "/shop",
  },
  {
    label: { en: "Contact Us", th: "ติดต่อเรา" },
    href: "/contact",
    children: [
      { label: { en: "About Us", th: "เกี่ยวกับเรา" }, href: "/contact/about" },
      { label: { en: "Contact Us", th: "ติดต่อเรา" }, href: "/contact" },
      { label: { en: "Advertise", th: "ลงโฆษณา" }, href: "/contact/advertise" },
      { label: { en: "Newsletter", th: "จดหมายข่าว" }, href: "/contact/newsletter" },
    ],
  },
  {
    label: { en: "Micro Site", th: "ไมโครไซต์" },
    href: "/microsite",
    children: [
      { label: { en: "CO.SPACE 1", th: "CO.SPACE 1" }, href: "/microsite/co-space-1" },
      { label: { en: "CO.SPACE 2", th: "CO.SPACE 2" }, href: "/microsite/co-space-2" },
    ],
  },
];

export const footerNav: NavItem[] = [
  { label: { en: "Privacy Policy", th: "นโยบายความเป็นส่วนตัว" }, href: "/legal/privacy" },
  { label: { en: "Terms & Conditions", th: "ข้อกำหนด" }, href: "/legal/terms" },
  { label: { en: "Cookie Policy", th: "คุกกี้" }, href: "/legal/cookies" },
  { label: { en: "Advertise", th: "ลงโฆษณา" }, href: "/contact/advertise" },
  { label: { en: "About Us", th: "เกี่ยวกับเรา" }, href: "/contact/about" },
  { label: { en: "Contact Us", th: "ติดต่อเรา" }, href: "/contact" },
];

/** WP category slug → used for homepage sections */
export const homeSections = {
  bites: "bites",
  photoEssay: "photo-essay",
  book: "book",
  coSpace: "co-space",
} as const;

export function hrefWithLang(href: string, lang: WPLanguage): string {
  if (lang === "en") return href;
  if (href === "/") return "/th";
  return `/th${href.startsWith("/") ? href : `/${href}`}`;
}

export function t(item: { label: Record<WPLanguage, string> }, lang: WPLanguage): string {
  return item.label[lang];
}
