/**
 * UpcomingCard Skeleton
 * Loading state placeholder
 */

export default function UpcomingCardSkeleton(): React.ReactElement {
  return (
    <div className="relative">
      <div className="overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 skeleton rounded-theme-md" />
          <div>
            <div className="w-36 h-5 skeleton rounded" />
            <div className="w-20 h-3 skeleton rounded mt-1" />
          </div>
        </div>

        <div className="bg-surface-2/50 rounded-theme-lg border border-white/10 p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 skeleton rounded-full" />
            <div className="flex-1">
              <div className="w-32 h-4 skeleton rounded" />
              <div className="w-20 h-3 skeleton rounded mt-2" />
              <div className="w-full h-3 skeleton rounded mt-3" />
            </div>
          </div>
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 skeleton rounded" />
                <div className="w-16 h-3 skeleton rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="flex-1 h-12 skeleton rounded-theme-md" />
          <div className="flex-1 h-12 skeleton rounded-theme-md" />
        </div>
      </div>
    </div>
  );
}
