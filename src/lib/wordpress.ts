import type { WPCategory, WPLanguage, WPPost } from "./types";

const API_BASE =
  process.env.WORDPRESS_API_URL ?? "https://art4d.com/wp-json";

const REVALIDATE = Number(process.env.REVALIDATE_SECONDS ?? 60);

async function wpFetch<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<T> {
  const url = new URL(`${API_BASE}/wp/v2${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status}: ${url.pathname}`);
  }

  return res.json() as Promise<T>;
}

export async function getPosts(
  lang: WPLanguage = "en",
  page = 1,
  perPage = 12,
): Promise<WPPost[]> {
  return wpFetch<WPPost[]>("/posts", {
    lang,
    page,
    per_page: perPage,
    _embed: "1",
  });
}

export async function getPostBySlug(
  slug: string,
  lang: WPLanguage,
): Promise<WPPost | null> {
  const posts = await wpFetch<WPPost[]>("/posts", {
    slug,
    lang,
    _embed: "1",
  });
  return posts[0] ?? null;
}

export async function getPostById(id: number): Promise<WPPost | null> {
  try {
    return await wpFetch<WPPost>(`/posts/${id}`, { _embed: "1" });
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>("/categories", { per_page: 100 });
}

export async function getCategoryBySlug(
  slug: string,
): Promise<WPCategory | null> {
  const cats = await wpFetch<WPCategory[]>("/categories", { slug });
  return cats[0] ?? null;
}

export async function getPostsByCategory(
  categoryId: number,
  lang: WPLanguage = "en",
  page = 1,
  perPage = 12,
): Promise<WPPost[]> {
  return wpFetch<WPPost[]>("/posts", {
    categories: categoryId,
    lang,
    page,
    per_page: perPage,
    _embed: "1",
  });
}
