import { articleMetadata, renderArticlePage } from "@/components/articles/ArticlePageView";

export const revalidate = 60;

/** Thai articles — matches art4d.com: /2026/06/slug (no /th prefix) */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string; slug: string }>;
}) {
  const { slug } = await params;
  return articleMetadata(slug, "th");
}

export default async function ThaiArticlePage({
  params,
}: {
  params: Promise<{ year: string; month: string; slug: string }>;
}) {
  const { slug } = await params;
  return renderArticlePage(slug, "th");
}
