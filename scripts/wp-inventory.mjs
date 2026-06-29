/**
 * Phase 0/2 — WordPress content & media inventory.
 * Run: node scripts/wp-inventory.mjs
 */
const API_BASE = process.env.WORDPRESS_API_URL ?? "https://art4d.com/wp-json";

async function fetchMeta(path, params = {}) {
  const url = new URL(`${API_BASE}/wp/v2${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);

  return {
    total: Number(res.headers.get("X-WP-Total") ?? 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 0),
    items: await res.json(),
  };
}

async function main() {
  console.log("art4d WordPress inventory\n");

  const languages = ["en", "th"];
  const postCounts = {};

  for (const lang of languages) {
    const { total } = await fetchMeta("/posts", { per_page: 1, lang });
    postCounts[lang] = total;
    console.log(`Posts (${lang}): ${total}`);
  }

  const { items: categories } = await fetchMeta("/categories", {
    per_page: 100,
    orderby: "count",
    order: "desc",
  });

  console.log(`\nCategories: ${categories.length}`);
  for (const cat of categories.slice(0, 15)) {
    console.log(`  ${cat.slug}: ${cat.count}`);
  }

  const { items: samplePosts } = await fetchMeta("/posts", {
    per_page: 5,
    lang: "en",
    _fields: "id,slug,link,featured_image_src",
  });

  const mediaHosts = new Set();
  for (const post of samplePosts) {
    const src = post.featured_image_src ?? post.link;
    try {
      mediaHosts.add(new URL(src).hostname);
    } catch {
      // skip
    }
  }

  console.log("\nMedia hosts (sample):", [...mediaHosts].join(", "));
  console.log("\nPhase 2 next steps:");
  console.log("  1. AWS S3 bucket + CloudFront distribution");
  console.log("  2. Bulk sync wp-content/uploads/ to S3");
  console.log("  3. Add CloudFront to next.config.ts remotePatterns");
  console.log("  4. URL rewrite script for post HTML (staging first)");

  const report = {
    generatedAt: new Date().toISOString(),
    apiBase: API_BASE,
    posts: postCounts,
    topCategories: categories.slice(0, 20).map((c) => ({
      slug: c.slug,
      name: c.name,
      count: c.count,
    })),
    mediaHosts: [...mediaHosts],
  };

  console.log("\nJSON report:");
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
