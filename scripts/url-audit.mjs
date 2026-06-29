/**
 * Compare WordPress post URLs vs headless demo responses.
 * Run: npm run audit
 *      npm run audit -- --limit=50 --site=http://localhost:3000
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API_BASE = process.env.WORDPRESS_API_URL ?? "https://art4d.com/wp-json";
const __dirname = dirname(fileURLToPath(import.meta.url));

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const SITE = args.site ?? "https://art4d-headless.vercel.app";
const LIMIT = Number(args.limit ?? 100);
const SKIP_ROUTES = args["skip-routes"] === true;

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

function loadStaticRoutes() {
  const navPath = join(__dirname, "../src/lib/navigation.ts");
  const source = readFileSync(navPath, "utf8");
  const hrefs = [...source.matchAll(/href:\s*"([^"]+)"/g)].map((m) => m[1]);
  const unique = [...new Set(hrefs)];

  const routes = new Set(["/", "/th", "/search", "/shop", "/shop/cart"]);
  for (const href of unique) {
    routes.add(href);
    routes.add(`/th${href}`);
  }
  return [...routes];
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

async function auditPosts(report) {
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
          report.failures.push({ type: "post", lang, path, status, wp: post.link });
        }
      }
    }
  }
}

async function auditRoutes(report) {
  const routes = loadStaticRoutes();
  console.log(`\nStatic routes (${routes.length})…`);

  for (const path of routes) {
    const status = await checkUrl(path);
    if (status >= 200 && status < 400) {
      report.routeOk++;
    } else {
      report.routeFail++;
      report.failures.push({ type: "route", path, status });
    }
  }
}

async function main() {
  console.log(`URL audit: ${SITE} (limit ${LIMIT} posts per language)`);

  const report = {
    ok: 0,
    fail: 0,
    nonStandard: 0,
    routeOk: 0,
    routeFail: 0,
    failures: [],
  };

  await auditPosts(report);

  if (!SKIP_ROUTES) {
    await auditRoutes(report);
  }

  console.log(`\nPosts OK: ${report.ok}`);
  console.log(`Posts failed: ${report.fail}`);
  console.log(`Non-standard WP URLs: ${report.nonStandard}`);

  if (!SKIP_ROUTES) {
    console.log(`Routes OK: ${report.routeOk}`);
    console.log(`Routes failed: ${report.routeFail}`);
  }

  if (report.failures.length) {
    console.log("\nFailures:");
    for (const f of report.failures.slice(0, 30)) {
      if (f.type === "post") {
        console.log(`  [${f.status}] ${f.path} ← ${f.wp}`);
      } else {
        console.log(`  [${f.status}] ${f.path}`);
      }
    }
  }

  const totalFail = report.fail + report.routeFail;
  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
