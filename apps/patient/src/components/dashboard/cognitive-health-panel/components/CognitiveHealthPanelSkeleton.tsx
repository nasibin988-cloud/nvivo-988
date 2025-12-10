/**
 * Cognitive Health Panel Skeleton
 * Loading state for the cognitive health panel
 */

export function CognitiveHealthPanelSkeleton(): React.ReactElement {
  return (
    <div className="relative">
      <div className="overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 skeleton rounded-theme-md" />
            <div className="w-64 h-6 skeleton rounded" />
          </div>
          <div className="space-y-3">
            <div className="w-40 h-4 skeleton rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-surface-2/50 rounded-theme-lg border border-white/10 p-4">
                  <div className="w-24 h-4 skeleton rounded mb-2" />
                  <div className="w-16 h-8 skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 skeleton rounded-theme-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
