import type { WPCategory, WPLanguage, WPPost, WPTag } from "./types";

const API_BASE =
  process.env.WORDPRESS_API_URL ?? "https://art4d.com/wp-json";

const REVALIDATE = Number(process.env.REVALIDATE_SECONDS ?? 60);

export type WPPagedResult<T> = {
  items: T[];
  total: number;
  totalPages: number;
  page: number;
};

async function wpFetchPaged<T>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<WPPagedResult<T>> {
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

  const page = Number(params.page ?? 1);
  return {
    items: (await res.json()) as T[],
    total: Number(res.headers.get("X-WP-Total") ?? 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 1),
    page,
  };
}

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
  const result = await getPostsByCategoryPaged(categoryId, lang, page, perPage);
  return result.items;
}

export async function getPostsByCategoryPaged(
  categoryId: number,
  lang: WPLanguage = "en",
  page = 1,
  perPage = 24,
): Promise<WPPagedResult<WPPost>> {
  return wpFetchPaged<WPPost>("/posts", {
    categories: categoryId,
    lang,
    page,
    per_page: perPage,
    _embed: "1",
  });
}

/** Fetch posts for sitemap generation (paginated). */
export async function getPostsPage(
  page: number,
  lang: WPLanguage = "en",
  perPage = 100,
): Promise<{ posts: WPPost[]; totalPages: number }> {
  const url = new URL(`${API_BASE}/wp/v2/posts`);
  url.searchParams.set("lang", lang);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("_fields", "slug,date,modified,link,lang");

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return { posts: [], totalPages: 0 };
  }

  const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? 1);
  const posts = (await res.json()) as WPPost[];
  return { posts, totalPages };
}

export async function getTagBySlug(slug: string): Promise<WPTag | null> {
  const tags = await wpFetch<WPTag[]>("/tags", { slug });
  return tags[0] ?? null;
}

export async function getPostsByTagPaged(
  tagId: number,
  lang: WPLanguage = "en",
  page = 1,
  perPage = 24,
): Promise<WPPagedResult<WPPost>> {
  return wpFetchPaged<WPPost>("/posts", {
    tags: tagId,
    lang,
    page,
    per_page: perPage,
    _embed: "1",
  });
}

type WPSearchHit = { id: number; type: string; subtype: string };

export async function searchPostsPaged(
  query: string,
  lang: WPLanguage = "en",
  page = 1,
  perPage = 24,
): Promise<WPPagedResult<WPPost>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { items: [], total: 0, totalPages: 0, page: 1 };
  }

  const url = new URL(`${API_BASE}/wp/v2/search`);
  url.searchParams.set("search", trimmed);
  url.searchParams.set("subtype", "post");
  url.searchParams.set("lang", lang);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE },
  });

  if (!res.ok) {
    return { items: [], total: 0, totalPages: 0, page };
  }

  const hits = (await res.json()) as WPSearchHit[];
  const postIds = hits
    .filter((hit) => hit.type === "post" && hit.subtype === "post")
    .map((hit) => hit.id);

  if (!postIds.length) {
    return {
      items: [],
      total: Number(res.headers.get("X-WP-Total") ?? 0),
      totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 0),
      page,
    };
  }

  const posts = await wpFetch<WPPost[]>("/posts", {
    include: postIds.join(","),
    per_page: postIds.length,
    _embed: "1",
  });

  const byId = new Map(posts.map((post) => [post.id, post]));
  const ordered = postIds
    .map((id) => byId.get(id))
    .filter((post): post is WPPost => Boolean(post));

  return {
    items: ordered,
    total: Number(res.headers.get("X-WP-Total") ?? ordered.length),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 1),
    page,
  };
}
