import { ArticleCard } from "@/components/articles/ArticleCard";
import { Pagination } from "@/components/layout/Pagination";
import type { WPLanguage, WPPost } from "@/lib/types";

export function ArticleGrid({
  posts,
  currentPage,
  totalPages,
  basePath,
  lang,
  emptyMessage,
  queryParams,
}: {
  posts: WPPost[];
  currentPage: number;
  totalPages: number;
  basePath: string;
  lang: WPLanguage;
  emptyMessage: string;
  queryParams?: Record<string, string>;
}) {
  return (
    <>
      {posts.length > 0 ? (
        <div className="archive-grid">
          {posts.map((post) => (
            <ArticleCard key={post.id} post={post} variant="default" />
          ))}
        </div>
      ) : (
        <p className="text-neutral-500">{emptyMessage}</p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath={basePath}
        lang={lang}
        queryParams={queryParams}
      />
    </>
  );
}
