import { AdSlot } from "@/components/ads/AdSlot";

type AdSize = "leaderboard" | "medium-rectangle" | "billboard";

export type MobileAdSlot = {
  id: string;
  size?: AdSize;
};

/** Mobile-only ads shown at the bottom of the content area. */
export function MobileAdStack({
  slots,
  className = "",
}: {
  slots: MobileAdSlot[];
  className?: string;
}) {
  if (!slots.length) return null;

  return (
    <div
      className={`mt-10 space-y-6 border-t border-neutral-200 pt-8 lg:hidden ${className}`}
      aria-label="Advertisements"
    >
      {slots.map((slot) => (
        <AdSlot key={slot.id} id={slot.id} size={slot.size ?? "medium-rectangle"} />
      ))}
    </div>
  );
}
