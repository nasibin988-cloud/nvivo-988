/**
 * NutritionSummary Component
 * Displays comprehensive nutrition data with user-toggleable detail level
 * Analysis always returns complete data; this component filters what to display
 * - Essential: Calories, protein, carbs, fat, fiber, sugar, sodium
 * - Extended: + Vitamins, minerals, fat breakdown
 * - Complete: + All micronutrients, bioactive compounds, metadata
 *
 * Uses personalized Daily Values when available (from My DVs calculation),
 * falling back to FDA baseline DVs otherwise.
 */

import type { LucideIcon } from 'lucide-react';
import { Sparkles, Flame, Beef, Wheat, Droplets, Leaf, Heart, Pill, Activity, ChevronDown, ChevronUp, User } from 'lucide-react';
import type { AnalysisResult, NutritionDetailLevel } from '../types';
import { NUTRIENT_DISPLAY_CONFIG } from '../data';
import { usePersonalizedDV, type PersonalizedDVs } from '../../../../../../hooks/nutrition/usePersonalizedDV';

interface NutritionSummaryProps {
  result: AnalysisResult;
  displayLevel: NutritionDetailLevel;
  onDisplayLevelChange: (level: NutritionDetailLevel) => void;
}

interface NutrientRowProps {
  label: string;
  value: number | undefined;
  unit: string;
  color: string;
  dailyValue?: number;
  /** For nutrients with no DV (like trans fat), show this warning text instead of % */
  noDVWarning?: string;
}

function NutrientRow({ label, value, unit, color, dailyValue, noDVWarning }: NutrientRowProps): React.ReactElement | null {
  if (value === undefined) return null;

  const percentage = dailyValue ? Math.round((value / dailyValue) * 100) : null;

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold" style={{ color }}>
          {typeof value === 'number' ? (value % 1 === 0 ? value : value.toFixed(1)) : value}
          {unit && <span className="text-text-muted ml-0.5">{unit}</span>}
        </span>
        {noDVWarning && value > 0 ? (
          <span className="text-[10px] text-red-400">({noDVWarning})</span>
        ) : percentage !== null && percentage > 0 ? (
          <span className="text-[10px] text-text-muted">({percentage}%)</span>
        ) : null}
      </div>
    </div>
  );
}

interface NutrientSectionProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  children: React.ReactNode;
}

function NutrientSection({ title, icon: Icon, iconColor, children }: NutrientSectionProps): React.ReactElement {
  return (
    <div className="pt-3 border-t border-white/[0.06]">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={12} style={{ color: iconColor }} />
        <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

/**
 * Get the Daily Value for a nutrient
 * Prioritizes personalized DVs over config defaults
 */
function getDV(key: string, personalizedDVs: PersonalizedDVs, configDV?: number): number | undefined {
  // Check personalized DVs first
  const personalized = personalizedDVs[key];
  if (personalized && personalized.dv > 0) {
    return personalized.dv;
  }
  // Fall back to config DV
  return configDV;
}

export default function NutritionSummary({ result, displayLevel, onDisplayLevelChange }: NutritionSummaryProps): React.ReactElement {
  // Display level controls what we show (user can toggle after analysis)
  const showExtended = displayLevel === 'extended' || displayLevel === 'complete';
  const showComplete = displayLevel === 'complete';

  const cfg = NUTRIENT_DISPLAY_CONFIG;

  // Get personalized Daily Values (falls back to FDA defaults if not set)
  const { dvs: personalizedDVs, isPersonalized, profile } = usePersonalizedDV();

  // Cycle through detail levels: essential -> extended -> complete -> essential
  const cycleDetailLevel = () => {
    const levels: NutritionDetailLevel[] = ['essential', 'extended', 'complete'];
    const currentIndex = levels.indexOf(displayLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    onDisplayLevelChange(levels[nextIndex]);
  };

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20">
      {/* Header with expandable detail level toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">AI Analysis</span>
          {isPersonalized && profile && (
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              <User size={9} />
              {profile.ageYears}{profile.sex === 'male' ? 'M' : 'F'}
            </span>
          )}
        </div>
        <button
          onClick={cycleDetailLevel}
          className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 capitalize hover:bg-violet-500/30 transition-colors"
        >
          {displayLevel}
          {showComplete ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )}
        </button>
      </div>

      {/* Calories Hero */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Flame size={20} className="text-amber-400" />
          <span className="text-4xl font-black text-white">{result.totalCalories}</span>
        </div>
        <span className="text-sm text-text-muted">calories</span>
      </div>

      {/* Primary Macros */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { key: 'protein', value: result.totalProtein, icon: Beef },
          { key: 'carbs', value: result.totalCarbs, icon: Wheat },
          { key: 'fat', value: result.totalFat, icon: Droplets },
        ].map(({ key, value, icon: Icon }) => {
          const config = cfg[key as keyof typeof cfg];
          return (
            <div
              key={key}
              className="p-3 rounded-xl text-center"
              style={{
                backgroundColor: `${config.color}15`,
                borderWidth: 1,
                borderColor: `${config.color}30`,
              }}
            >
              <Icon size={14} className="mx-auto mb-1" style={{ color: config.color }} />
              <span className="text-lg font-bold block" style={{ color: config.color }}>
                {value}{config.unit}
              </span>
              <span className="text-[10px] text-text-muted">{config.label}</span>
            </div>
          );
        })}
      </div>

      {/* Essential Additional (always shown) */}
      <NutrientSection title="Nutrition Facts" icon={Leaf} iconColor="#34d399">
        <NutrientRow label={cfg.fiber.label} value={result.totalFiber} unit={cfg.fiber.unit} color={cfg.fiber.color} dailyValue={getDV('fiber', personalizedDVs, cfg.fiber.dailyValue)} />
        <NutrientRow label={cfg.sugar.label} value={result.totalSugar} unit={cfg.sugar.unit} color={cfg.sugar.color} dailyValue={getDV('sugar', personalizedDVs, cfg.sugar.dailyValue)} />
        <NutrientRow label={cfg.sodium.label} value={result.totalSodium} unit={cfg.sodium.unit} color={cfg.sodium.color} dailyValue={getDV('sodium', personalizedDVs, cfg.sodium.dailyValue)} />
      </NutrientSection>

      {/* Extended: Fat Breakdown */}
      {showExtended && (
        <NutrientSection title="Fat Breakdown" icon={Droplets} iconColor="#60a5fa">
          <NutrientRow label={cfg.saturatedFat.label} value={result.totalSaturatedFat} unit={cfg.saturatedFat.unit} color={cfg.saturatedFat.color} dailyValue={getDV('saturatedFat', personalizedDVs, cfg.saturatedFat.dailyValue)} />
          <NutrientRow label={cfg.transFat.label} value={result.totalTransFat} unit={cfg.transFat.unit} color={cfg.transFat.color} noDVWarning="Minimize" />
          <NutrientRow label={cfg.cholesterol.label} value={result.totalCholesterol} unit={cfg.cholesterol.unit} color={cfg.cholesterol.color} dailyValue={getDV('cholesterol', personalizedDVs, cfg.cholesterol.dailyValue)} />
          {showComplete && (
            <>
              <NutrientRow label={cfg.monounsaturatedFat.label} value={result.totalMonounsaturatedFat} unit={cfg.monounsaturatedFat.unit} color={cfg.monounsaturatedFat.color} />
              <NutrientRow label={cfg.polyunsaturatedFat.label} value={result.totalPolyunsaturatedFat} unit={cfg.polyunsaturatedFat.unit} color={cfg.polyunsaturatedFat.color} />
              <NutrientRow label={cfg.omega3.label} value={result.totalOmega3} unit={cfg.omega3.unit} color={cfg.omega3.color} dailyValue={getDV('omega3', personalizedDVs, cfg.omega3.dailyValue)} />
              <NutrientRow label={cfg.omega6.label} value={result.totalOmega6} unit={cfg.omega6.unit} color={cfg.omega6.color} dailyValue={getDV('omega6', personalizedDVs, cfg.omega6.dailyValue)} />
              <NutrientRow label={cfg.epaDha.label} value={result.totalEpaDha} unit={cfg.epaDha.unit} color={cfg.epaDha.color} dailyValue={getDV('epaDha', personalizedDVs, cfg.epaDha.dailyValue)} />
            </>
          )}
        </NutrientSection>
      )}

      {/* Extended: Minerals */}
      {showExtended && (
        <NutrientSection title="Minerals" icon={Pill} iconColor="#a78bfa">
          <NutrientRow label={cfg.potassium.label} value={result.totalPotassium} unit={cfg.potassium.unit} color={cfg.potassium.color} dailyValue={getDV('potassium', personalizedDVs, cfg.potassium.dailyValue)} />
          <NutrientRow label={cfg.calcium.label} value={result.totalCalcium} unit={cfg.calcium.unit} color={cfg.calcium.color} dailyValue={getDV('calcium', personalizedDVs, cfg.calcium.dailyValue)} />
          <NutrientRow label={cfg.iron.label} value={result.totalIron} unit={cfg.iron.unit} color={cfg.iron.color} dailyValue={getDV('iron', personalizedDVs, cfg.iron.dailyValue)} />
          <NutrientRow label={cfg.magnesium.label} value={result.totalMagnesium} unit={cfg.magnesium.unit} color={cfg.magnesium.color} dailyValue={getDV('magnesium', personalizedDVs, cfg.magnesium.dailyValue)} />
          <NutrientRow label={cfg.zinc.label} value={result.totalZinc} unit={cfg.zinc.unit} color={cfg.zinc.color} dailyValue={getDV('zinc', personalizedDVs, cfg.zinc.dailyValue)} />
          {showComplete && (
            <>
              <NutrientRow label={cfg.phosphorus.label} value={result.totalPhosphorus} unit={cfg.phosphorus.unit} color={cfg.phosphorus.color} dailyValue={getDV('phosphorus', personalizedDVs, cfg.phosphorus.dailyValue)} />
              <NutrientRow label={cfg.copper.label} value={result.totalCopper} unit={cfg.copper.unit} color={cfg.copper.color} dailyValue={getDV('copper', personalizedDVs, cfg.copper.dailyValue)} />
              <NutrientRow label={cfg.manganese.label} value={result.totalManganese} unit={cfg.manganese.unit} color={cfg.manganese.color} dailyValue={getDV('manganese', personalizedDVs, cfg.manganese.dailyValue)} />
              <NutrientRow label={cfg.selenium.label} value={result.totalSelenium} unit={cfg.selenium.unit} color={cfg.selenium.color} dailyValue={getDV('selenium', personalizedDVs, cfg.selenium.dailyValue)} />
            </>
          )}
        </NutrientSection>
      )}

      {/* Extended: Vitamins */}
      {showExtended && (
        <NutrientSection title="Vitamins" icon={Heart} iconColor="#fb7185">
          <NutrientRow label={cfg.vitaminA.label} value={result.totalVitaminA} unit={cfg.vitaminA.unit} color={cfg.vitaminA.color} dailyValue={getDV('vitaminA', personalizedDVs, cfg.vitaminA.dailyValue)} />
          <NutrientRow label={cfg.vitaminC.label} value={result.totalVitaminC} unit={cfg.vitaminC.unit} color={cfg.vitaminC.color} dailyValue={getDV('vitaminC', personalizedDVs, cfg.vitaminC.dailyValue)} />
          <NutrientRow label={cfg.vitaminD.label} value={result.totalVitaminD} unit={cfg.vitaminD.unit} color={cfg.vitaminD.color} dailyValue={getDV('vitaminD', personalizedDVs, cfg.vitaminD.dailyValue)} />
          {showComplete && (
            <>
              <NutrientRow label={cfg.vitaminE.label} value={result.totalVitaminE} unit={cfg.vitaminE.unit} color={cfg.vitaminE.color} dailyValue={getDV('vitaminE', personalizedDVs, cfg.vitaminE.dailyValue)} />
              <NutrientRow label={cfg.vitaminK.label} value={result.totalVitaminK} unit={cfg.vitaminK.unit} color={cfg.vitaminK.color} dailyValue={getDV('vitaminK', personalizedDVs, cfg.vitaminK.dailyValue)} />
              <NutrientRow label={cfg.thiamin.label} value={result.totalThiamin} unit={cfg.thiamin.unit} color={cfg.thiamin.color} dailyValue={getDV('thiamin', personalizedDVs, cfg.thiamin.dailyValue)} />
              <NutrientRow label={cfg.riboflavin.label} value={result.totalRiboflavin} unit={cfg.riboflavin.unit} color={cfg.riboflavin.color} dailyValue={getDV('riboflavin', personalizedDVs, cfg.riboflavin.dailyValue)} />
              <NutrientRow label={cfg.niacin.label} value={result.totalNiacin} unit={cfg.niacin.unit} color={cfg.niacin.color} dailyValue={getDV('niacin', personalizedDVs, cfg.niacin.dailyValue)} />
              <NutrientRow label={cfg.vitaminB6.label} value={result.totalVitaminB6} unit={cfg.vitaminB6.unit} color={cfg.vitaminB6.color} dailyValue={getDV('vitaminB6', personalizedDVs, cfg.vitaminB6.dailyValue)} />
              <NutrientRow label={cfg.folate.label} value={result.totalFolate} unit={cfg.folate.unit} color={cfg.folate.color} dailyValue={getDV('folate', personalizedDVs, cfg.folate.dailyValue)} />
              <NutrientRow label={cfg.vitaminB12.label} value={result.totalVitaminB12} unit={cfg.vitaminB12.unit} color={cfg.vitaminB12.color} dailyValue={getDV('vitaminB12', personalizedDVs, cfg.vitaminB12.dailyValue)} />
              <NutrientRow label={cfg.choline.label} value={result.totalCholine} unit={cfg.choline.unit} color={cfg.choline.color} dailyValue={getDV('choline', personalizedDVs, cfg.choline.dailyValue)} />
            </>
          )}
        </NutrientSection>
      )}

      {/* Complete: Other */}
      {showComplete && (result.totalCaffeine !== undefined || result.totalWater !== undefined) && (
        <NutrientSection title="Other" icon={Activity} iconColor="#22d3ee">
          <NutrientRow label={cfg.caffeine.label} value={result.totalCaffeine} unit={cfg.caffeine.unit} color={cfg.caffeine.color} dailyValue={getDV('caffeine', personalizedDVs, cfg.caffeine.dailyValue)} />
          <NutrientRow label={cfg.water.label} value={result.totalWater} unit={cfg.water.unit} color={cfg.water.color} dailyValue={getDV('water', personalizedDVs, cfg.water.dailyValue)} />
          {result.totalAddedSugar !== undefined && (
            <NutrientRow label={cfg.addedSugar.label} value={result.totalAddedSugar} unit={cfg.addedSugar.unit} color={cfg.addedSugar.color} dailyValue={getDV('addedSugar', personalizedDVs, cfg.addedSugar.dailyValue)} />
          )}
        </NutrientSection>
      )}

      {/* Dietary Flags */}
      {result.dietaryFlags && result.dietaryFlags.length > 0 && (
        <div className="pt-3 mt-2 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-1.5">
            {result.dietaryFlags.map((flag) => (
              <span
                key={flag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 capitalize"
              >
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Allergens Warning */}
      {result.allergens && result.allergens.length > 0 && (
        <div className="pt-3 mt-2 border-t border-rose-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-medium text-rose-400 uppercase tracking-wider">
              Contains Allergens
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.allergens.map((allergen) => (
              <span
                key={allergen}
                className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 capitalize"
              >
                {allergen}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
