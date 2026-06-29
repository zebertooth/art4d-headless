/**
 * Compare WordPress post URLs vs headless demo responses.
 * Run: node scripts/url-audit.mjs [--limit=100] [--site=https://art4d-headless.vercel.app]
 */
const API_BASE = process.env.WORDPRESS_API_URL ?? "https://art4d.com/wp-json";
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const SITE = args.site ?? "https://art4d-headless.vercel.app";
const LIMIT = Number(args.limit ?? 100);

function parseArticlePathFromLink(link) {
  try {
    const pathname = new URL(link).pathname;
    const enMatch = pathname.match(/^\/en\/(\d{4})\/(\d{2})\/([^/]+)\/?$/);
    if (enMatch) {
      return `/en/${enMatch[1]}/${enMatch[2]}/${enMatch[3]}`;
    }
    const thMatch = pathname.match(/^\/(\d{4})\/(\d{2})\/([^/]+)\/?$/);
    if (thMatch) {
      return `/${thMatch[1]}/${thMatch[2]}/${thMatch[3]}`;
    }
    return null;
  } catch {
    return null;
  }
}

function getPostHref(post) {
  const parsed = parseArticlePathFromLink(post.link);
  if (parsed) return parsed;
  const lang = post.lang ?? "en";
  return lang === "en" ? `/en/article/${post.slug}` : `/article/${post.slug}`;
}

async function fetchPosts(lang, page, perPage) {
  const url = new URL(`${API_BASE}/wp/v2/posts`);
  url.searchParams.set("lang", lang);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("_fields", "id,slug,link,lang");

  const res = await fetch(url);
  if (!res.ok) return { posts: [], totalPages: 0 };
  return {
    posts: await res.json(),
    totalPages: Number(res.headers.get("X-WP-TotalPages") ?? 0),
  };
}

async function checkUrl(path) {
  try {
    const res = await fetch(`${SITE}${path}`, { redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

async function main() {
  console.log(`URL audit: ${SITE} (limit ${LIMIT} per language)\n`);

  const report = { ok: 0, fail: 0, nonStandard: 0, failures: [] };

  for (const lang of ["en", "th"]) {
    const perPage = Math.min(LIMIT, 100);
    const pages = Math.ceil(LIMIT / perPage);
    let checked = 0;

    for (let page = 1; page <= pages && checked < LIMIT; page++) {
      const { posts } = await fetchPosts(lang, page, perPage);

      for (const post of posts) {
        if (checked >= LIMIT) break;
        checked++;

        if (!parseArticlePathFromLink(post.link)) report.nonStandard++;

        const path = getPostHref(post);
        const status = await checkUrl(path);

        if (status >= 200 && status < 400) {
          report.ok++;
        } else {
          report.fail++;
          report.failures.push({ lang, path, status, wp: post.link });
        }
      }
    }
  }

  console.log(`OK: ${report.ok}`);
  console.log(`Failed: ${report.fail}`);
  console.log(`Non-standard WP URLs: ${report.nonStandard}`);
  if (report.failures.length) {
    console.log("\nFailures:");
    for (const f of report.failures.slice(0, 20)) {
      console.log(`  [${f.status}] ${f.path} ← ${f.wp}`);
    }
  }

  process.exit(report.fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
