import { articleMetadata, renderArticlePage } from "@/components/articles/ArticlePageView";
import { notFound } from "next/navigation";

export const revalidate = 60;

/** English articles — matches art4d.com: /en/2026/06/slug */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; year: string; month: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (lang !== "en") return { title: "Article" };
  return articleMetadata(slug, "en");
}

export default async function EnglishArticlePage({
  params,
}: {
  params: Promise<{ lang: string; year: string; month: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (lang !== "en") notFound();
  return renderArticlePage(slug, "en");
}
