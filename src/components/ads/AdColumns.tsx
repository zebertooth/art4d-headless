import { AdSlot } from "@/components/ads/AdSlot";

type AdSize = "leaderboard" | "medium-rectangle" | "billboard";

/** Full-width single-column ad row. */
export function AdOneColumn({
  id,
  size = "leaderboard",
  className = "",
}: {
  id: string;
  size?: AdSize;
  className?: string;
}) {
  return <AdSlot id={id} size={size} className={className} />;
}

/** Two ads side by side (stacks on small screens). */
export function AdTwoColumn({
  idPrefix,
  size = "medium-rectangle",
  className = "",
}: {
  idPrefix: string;
  size?: AdSize;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${className}`}>
      <AdSlot id={`${idPrefix}-left`} size={size} />
      <AdSlot id={`${idPrefix}-right`} size={size} />
    </div>
  );
}
