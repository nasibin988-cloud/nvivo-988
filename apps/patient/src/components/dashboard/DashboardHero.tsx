import { Flame, Utensils, Pill, Moon } from 'lucide-react';
import { VitalityRing, VitalityRingSkeleton } from './VitalityRing';
import type { WellnessLog, Streak, MedicationStatus, FoodLogStatus } from '../../hooks/dashboard';

interface DashboardHeroProps {
  wellnessLog: WellnessLog | null | undefined;
  streak: Streak | null | undefined;
  medicationStatus: MedicationStatus | null | undefined;
  foodLogStatus: FoodLogStatus | null | undefined;
  ringVariant?: 1 | 2 | 3 | 4 | 5;
  ringAnimation?: 0 | 1 | 2 | 3 | 4;
  onLogMeal?: () => void;
  onLogMedication?: () => void;
  onLogWellness?: () => void;
}

// Floating Orb component for stats
function Orb({
  icon: Icon,
  value,
  label,
  progress,
  color,
}: {
  icon: React.ComponentType<Record<string, unknown>>;
  value: string | number;
  label: string;
  progress?: number;
  color: string;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {/* Glow */}
      <div
        className="absolute w-[52px] h-[52px] rounded-full blur-lg opacity-25"
        style={{ backgroundColor: color }}
      />
      {/* Orb */}
      <div className="relative w-[52px] h-[52px] rounded-full bg-surface-2 border border-white/5 flex flex-col items-center justify-center overflow-hidden">
        {progress !== undefined && (
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-700"
            style={{
              height: `${progress}%`,
              background: `linear-gradient(to top, ${color}35, ${color}10)`,
            }}
          />
        )}
        <Icon size={14} className="relative z-10" style={{ color }} />
        <span className="relative z-10 text-[11px] font-bold text-white mt-0.5">{value}</span>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-text-muted mt-1.5">{label}</span>
    </div>
  );
}

export function DashboardHero({
  wellnessLog,
  streak,
  medicationStatus,
  foodLogStatus,
  ringVariant = 4,
  ringAnimation = 4,
}: DashboardHeroProps): JSX.Element {
  const sleepQuality = wellnessLog?.sleepQuality ?? null;
  const mealProgress = foodLogStatus?.totalMeals
    ? (foodLogStatus.loggedMeals / foodLogStatus.totalMeals) * 100
    : 0;
  const medProgress = medicationStatus?.totalDoses
    ? (medicationStatus.takenDoses / medicationStatus.totalDoses) * 100
    : 0;
  const sleepPercent = sleepQuality ? (sleepQuality / 10) * 100 : 0;

  return (
    <div className="relative bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5 shadow-card">
      {/* 5-column grid: [Streak] [Sleep] [Ring] [Meals] [Meds] */}
      <div className="relative grid grid-cols-[1fr_1fr_auto_1fr_1fr] gap-2 items-center min-h-[180px]">
        {/* Streak - Floating Flame Hero - Column 1 */}
        <div className="flex justify-center col-start-1 row-start-1">
          <div className="relative flex flex-col items-center">
            <div className="absolute w-[72px] h-[72px] rounded-full bg-gradient-to-b from-orange-500/30 to-amber-500/10 blur-xl" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/15 to-amber-500/5 border border-orange-500/25 flex flex-col items-center justify-center">
              <Flame
                size={22}
                className="text-orange-500"
                style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.6))' }}
              />
              <span className="text-xl font-bold text-white -mt-0.5">{streak?.currentStreak ?? 0}</span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.15em] text-orange-400/80 mt-1.5">streak</span>
          </div>
        </div>

        {/* Sleep - Column 2 */}
        <div className="flex justify-center col-start-2 row-start-1">
          <Orb
            icon={Moon}
            value={sleepQuality?.toFixed(1) ?? '—'}
            label="sleep"
            progress={sleepPercent}
            color="#A855F7"
          />
        </div>

        {/* Ring in center - Column 3 */}
        <div className="flex justify-center col-start-3 row-start-1">
          <VitalityRing wellnessLog={wellnessLog} size={150} strokeWidth={10} variant={ringVariant} animation={ringAnimation} />
        </div>

        {/* Meals - Column 4 */}
        <div className="flex justify-center col-start-4 row-start-1">
          <Orb
            icon={Utensils}
            value={`${foodLogStatus?.loggedMeals ?? 0}/${foodLogStatus?.totalMeals ?? 4}`}
            label="meals"
            progress={mealProgress}
            color="#10B981"
          />
        </div>

        {/* Meds - Column 5 */}
        <div className="flex justify-center col-start-5 row-start-1">
          <Orb
            icon={Pill}
            value={`${medicationStatus?.takenDoses ?? 0}/${medicationStatus?.totalDoses ?? 0}`}
            label="meds"
            progress={medProgress}
            color="#3B82F6"
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardHeroSkeleton(): JSX.Element {
  return (
    <div className="rounded-theme-xl bg-surface border border-border p-5 animate-pulse">
      <div className="grid grid-cols-[1fr_1fr_auto_1fr_1fr] gap-2 items-center min-h-[180px]">
        {/* Streak skeleton */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-surface-2" />
        </div>
        {/* Sleep skeleton */}
        <div className="flex justify-center">
          <div className="w-[52px] h-[52px] rounded-full bg-surface-2" />
        </div>
        {/* Ring skeleton */}
        <div className="flex justify-center">
          <VitalityRingSkeleton size={150} strokeWidth={10} />
        </div>
        {/* Meals skeleton */}
        <div className="flex justify-center">
          <div className="w-[52px] h-[52px] rounded-full bg-surface-2" />
        </div>
        {/* Meds skeleton */}
        <div className="flex justify-center">
          <div className="w-[52px] h-[52px] rounded-full bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
