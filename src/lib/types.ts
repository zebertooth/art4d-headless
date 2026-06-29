export type WPLanguage = "en" | "th";

export interface WPAuthorInfo {
  display_name: string;
  author_link: string;
}

export interface WPPost {
  id: number;
  slug: string;
  date: string;
  modified?: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  tags: number[];
  lang?: WPLanguage;
  translations?: Partial<Record<WPLanguage, number>>;
  featured_image_src?: string;
  author_info?: WPAuthorInfo;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        width?: number;
        height?: number;
      };
    }>;
    "wp:term"?: Array<
      Array<{
        id: number;
        name: string;
        slug: string;
        taxonomy: string;
      }>
    >;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface WPTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface ArticlePath {
  lang: WPLanguage;
  year: string;
  month: string;
  slug: string;
}
