type AdSize = "leaderboard" | "medium-rectangle" | "billboard";

const sizeClasses: Record<AdSize, string> = {
  leaderboard: "min-h-[90px] max-h-[120px]",
  "medium-rectangle": "min-h-[250px] max-h-[280px]",
  billboard: "min-h-[120px] sm:min-h-[180px]",
};

type AdSlotProps = {
  id: string;
  size?: AdSize;
  label?: string;
  className?: string;
};

/** Placeholder ad unit — swap inner content for GAM / AdSense script later */
export function AdSlot({
  id,
  size = "leaderboard",
  label = "Advertisement",
  className = "",
}: AdSlotProps) {
  return (
    <aside
      id={id}
      data-ad-slot={id}
      className={`ad-slot flex w-full items-center justify-center border border-dashed border-neutral-200 bg-neutral-50 ${sizeClasses[size]} ${className}`}
      aria-label={label}
    >
      <div className="px-4 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-400">
          {label}
        </p>
        <p className="mt-1 font-mono text-xs text-neutral-300">{id}</p>
      </div>
    </aside>
  );
}
