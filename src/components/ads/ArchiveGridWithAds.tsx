import { AdOneColumn } from "@/components/ads/AdColumns";
import { ArticleCard } from "@/components/articles/ArticleCard";
import type { WPPost } from "@/lib/types";
import type { ReactNode } from "react";

/** Category archive — 2-column grid with full-width ad rows between article groups. */
export function ArchiveGridWithAds({
  posts,
  adIdPrefix,
  interval = 4,
}: {
  posts: WPPost[];
  adIdPrefix: string;
  interval?: number;
}) {
  const nodes: ReactNode[] = [];
  let adIndex = 0;

  posts.forEach((post, index) => {
    nodes.push(<ArticleCard key={post.id} post={post} variant="default" />);

    if ((index + 1) % interval === 0 && index < posts.length - 1) {
      adIndex += 1;
      nodes.push(
        <div key={`${adIdPrefix}-row-${adIndex}`} className="archive-ad-row">
          <AdOneColumn
            id={`${adIdPrefix}-inline-${adIndex}`}
            size="leaderboard"
          />
        </div>,
      );
    }
  });

  return <div className="archive-grid-with-ads">{nodes}</div>;
}
