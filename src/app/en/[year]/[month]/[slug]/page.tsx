import { articleMetadata, renderArticlePage } from "@/components/articles/ArticlePageView";

export const revalidate = 60;

/** English articles — matches art4d.com: /en/2026/06/slug */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string; month: string; slug: string }>;
}) {
  const { slug } = await params;
  return articleMetadata(slug, "en");
}

export default async function EnglishArticlePage({
  params,
}: {
  params: Promise<{ year: string; month: string; slug: string }>;
}) {
  const { slug } = await params;
  return renderArticlePage(slug, "en");
}
