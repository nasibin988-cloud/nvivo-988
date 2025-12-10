/**
 * NutritionSkeleton - Loading state for Nutrition tab
 * Shows animated placeholder content while data loads
 */

export function NutritionSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4 pb-4 animate-pulse">
      {/* View Toggle Skeleton */}
      <div className="h-12 bg-surface-2 rounded-xl" />

      {/* Hero Card Skeleton */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <div className="h-5 w-32 bg-surface-2 rounded" />
            <div className="h-3 w-24 bg-surface-2 rounded" />
          </div>
          <div className="h-10 w-24 bg-surface-2 rounded" />
        </div>
        <div className="h-3 bg-surface-2 rounded-full" />
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 bg-surface-2 rounded-full" />
              <div className="h-3 w-8 bg-surface-2 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Water Tracker Skeleton */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex justify-between mb-3">
          <div className="h-4 w-24 bg-surface-2 rounded" />
          <div className="h-4 w-16 bg-surface-2 rounded" />
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1 h-8 bg-surface-2 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-surface-2 rounded-2xl" />
        <div className="h-14 bg-surface-2 rounded-2xl" />
      </div>

      {/* Meals Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-24 bg-surface-2 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-2 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
