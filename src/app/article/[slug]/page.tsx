import { articleMetadata, renderArticlePage } from "@/components/articles/ArticlePageView";

export const revalidate = 60;

/** Fallback for Thai posts when canonical URL is unavailable. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return articleMetadata(slug, "th");
}

export default async function ThaiArticleFallbackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return renderArticlePage(slug, "th");
}
