import { articleMetadata, renderArticlePage } from "@/components/articles/ArticlePageView";

export const revalidate = 60;

/** Fallback for English posts when canonical URL is unavailable. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return articleMetadata(slug, "en");
}

export default async function EnglishArticleFallbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderArticlePage(slug, "en");
}
