import { AdSlot } from "@/components/ads/AdSlot";

type AdSize = "leaderboard" | "medium-rectangle" | "billboard";

export type AdRailSlot = {
  id: string;
  size?: AdSize;
};

/** Desktop sidebar ads — stick while the main column scrolls. */
export function StickyAdRail({
  slots,
  className = "",
}: {
  slots: AdRailSlot[];
  className?: string;
}) {
  if (!slots.length) return null;

  return (
    <aside className={`hidden lg:block ${className}`}>
      <div className="sticky top-28 space-y-6">
        {slots.map((slot) => (
          <AdSlot key={slot.id} id={slot.id} size={slot.size ?? "medium-rectangle"} />
        ))}
      </div>
    </aside>
  );
}
