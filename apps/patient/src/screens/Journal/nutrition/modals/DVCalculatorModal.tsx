/**
 * DVCalculatorModal - Calculate Personalized Daily Values
 *
 * Allows patients to input their demographics and calculate personalized
 * nutrition targets based on DRI (Dietary Reference Intakes) system.
 * Preloads data from profile when available.
 *
 * Results display is non-collapsible with comprehensive nutrition data
 * styled similar to the AI food analysis complete view.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  X,
  Save,
  Sparkles,
  User,
  Activity,
  Target,
  Info,
  Loader2,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Leaf,
  Heart,
  Pill,
  AlertTriangle,
  HelpCircle,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFunctions, getDb } from '@nvivo/shared';
import { useAuth } from '../../../../contexts/AuthContext';
import type { UserNutritionTargets, NutrientTarget } from '../../../../hooks/nutrition/useNutritionTargetsV2';

// ============================================================================
// TYPES
// ============================================================================

interface DVCalculatorModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

type Sex = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'athlete';
type NutritionGoal = 'weight_loss' | 'maintenance' | 'weight_gain' | 'muscle_gain' | 'performance';

interface FormData {
  dateOfBirth: string;
  sex: Sex;
  weightKg: string;
  heightCm: string;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  isPregnant: boolean;
  isLactating: boolean;
}

interface NutritionProfile {
  userId: string;
  dateOfBirth: string;
  sex: Sex;
  weightKg?: number;
  heightCm?: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  isPregnant?: boolean;
  isLactating?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'light', label: 'Light', description: '1-3 days/week' },
  { value: 'moderate', label: 'Moderate', description: '3-5 days/week' },
  { value: 'high', label: 'Active', description: '6-7 days/week' },
  { value: 'athlete', label: 'Athlete', description: '2x daily training' },
];

const GOALS: { value: NutritionGoal; label: string }[] = [
  { value: 'weight_loss', label: 'Lose Weight' },
  { value: 'maintenance', label: 'Maintain' },
  { value: 'weight_gain', label: 'Gain Weight' },
  { value: 'muscle_gain', label: 'Build Muscle' },
  { value: 'performance', label: 'Performance' },
];

// Nutrient groupings for display (non-collapsible sections)
interface NutrientGroupConfig {
  title: string;
  icon: React.ComponentType<Record<string, unknown>>;
  iconColor: string;
  nutrients: string[];
}

const NUTRIENT_GROUPS: NutrientGroupConfig[] = [
  {
    title: 'Macronutrients',
    icon: Beef,
    iconColor: '#fb7185',
    nutrients: ['protein', 'carbohydrate', 'total_fat', 'fiber'],
  },
  {
    title: 'Fats & Fatty Acids',
    icon: Droplets,
    iconColor: '#60a5fa',
    nutrients: ['saturated_fat', 'trans_fat', 'linoleic_acid', 'alpha_linolenic_acid', 'epa_dha'],
  },
  {
    title: 'Sugars',
    icon: Zap,
    iconColor: '#fbbf24',
    nutrients: ['total_sugars', 'added_sugars'],
  },
  {
    title: 'Fat-Soluble Vitamins',
    icon: Heart,
    iconColor: '#f472b6',
    nutrients: ['vitamin_a', 'vitamin_d', 'vitamin_e', 'vitamin_k'],
  },
  {
    title: 'Water-Soluble Vitamins',
    icon: Heart,
    iconColor: '#fb923c',
    nutrients: ['vitamin_c', 'thiamin', 'riboflavin', 'niacin', 'vitamin_b6', 'folate', 'vitamin_b12', 'pantothenic_acid', 'biotin', 'choline'],
  },
  {
    title: 'Major Minerals',
    icon: Pill,
    iconColor: '#a78bfa',
    nutrients: ['calcium', 'phosphorus', 'magnesium', 'sodium', 'potassium'],
  },
  {
    title: 'Trace Minerals',
    icon: Pill,
    iconColor: '#22d3ee',
    nutrients: ['iron', 'zinc', 'copper', 'manganese', 'selenium', 'iodine', 'chromium', 'molybdenum'],
  },
];

// Tag types for nutrient values
type TagType = 'RDA' | 'AI' | 'UL' | 'AMDR' | 'CDRR' | 'Limit' | 'Expert' | 'No DV';

interface TagConfig {
  bg: string;
  text: string;
  label: string;
  description: string;
}

const TAG_CONFIGS: Record<TagType, TagConfig> = {
  RDA: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    label: 'RDA',
    description: 'Recommended Dietary Allowance - meets needs of 97-98% of healthy individuals',
  },
  AI: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    label: 'AI',
    description: 'Adequate Intake - assumed to ensure nutritional adequacy when RDA cannot be determined',
  },
  UL: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    label: 'UL',
    description: 'Tolerable Upper Intake Level - maximum daily intake unlikely to cause adverse effects',
  },
  AMDR: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    label: 'AMDR',
    description: 'Acceptable Macronutrient Distribution Range - % of calories for optimal health',
  },
  CDRR: {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    label: 'CDRR',
    description: 'Chronic Disease Risk Reduction - intake to reduce chronic disease risk',
  },
  Limit: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    label: 'Limit',
    description: 'No safe level established - minimize intake as much as possible',
  },
  Expert: {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    label: 'Expert',
    description: 'Expert recommendation from scientific organizations (e.g., AHA)',
  },
  'No DV': {
    bg: 'bg-slate-500/20',
    text: 'text-slate-400',
    label: 'No DV',
    description: 'No Daily Value established by FDA - guidance varies',
  },
};

// ============================================================================
// HELPERS
// ============================================================================

function formatUnit(unit: string): string {
  const unitMap: Record<string, string> = {
    g: 'g',
    mg: 'mg',
    mcg: 'mcg',
    mcg_rae: 'mcg RAE',
    mcg_dfe: 'mcg DFE',
    mg_niacin_equiv: 'mg NE',
    iu: 'IU',
    percent_of_calories: '% cal',
  };
  return unitMap[unit] ?? unit;
}

function formatNutrientName(id: string): string {
  const nameMap: Record<string, string> = {
    vitamin_a: 'Vitamin A',
    vitamin_c: 'Vitamin C',
    vitamin_d: 'Vitamin D',
    vitamin_e: 'Vitamin E',
    vitamin_k: 'Vitamin K',
    vitamin_b6: 'Vitamin B6',
    vitamin_b12: 'Vitamin B12',
    thiamin: 'Thiamin (B1)',
    riboflavin: 'Riboflavin (B2)',
    niacin: 'Niacin (B3)',
    pantothenic_acid: 'Pantothenic Acid (B5)',
    biotin: 'Biotin (B7)',
    folate: 'Folate (B9)',
    choline: 'Choline',
    calcium: 'Calcium',
    phosphorus: 'Phosphorus',
    magnesium: 'Magnesium',
    sodium: 'Sodium',
    potassium: 'Potassium',
    iron: 'Iron',
    zinc: 'Zinc',
    copper: 'Copper',
    manganese: 'Manganese',
    selenium: 'Selenium',
    iodine: 'Iodine',
    chromium: 'Chromium',
    molybdenum: 'Molybdenum',
    protein: 'Protein',
    carbohydrate: 'Carbohydrates',
    total_fat: 'Total Fat',
    fiber: 'Fiber',
    saturated_fat: 'Saturated Fat',
    trans_fat: 'Trans Fat',
    linoleic_acid: 'Omega-6 (Linoleic)',
    alpha_linolenic_acid: 'Omega-3 (ALA)',
    epa_dha: 'EPA + DHA (Fish Oil)',
    total_sugars: 'Total Sugars',
    added_sugars: 'Added Sugars',
  };
  return nameMap[id] ?? id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DVCalculatorModal({ onClose, onSaved }: DVCalculatorModalProps): React.ReactElement {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<UserNutritionTargets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  // Track if user has saved targets and if they're editing
  const [hasSavedTargets, setHasSavedTargets] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // Track if current results differ from saved (needs saving)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    dateOfBirth: '1990-01-01',
    sex: 'male',
    weightKg: '',
    heightCm: '',
    activityLevel: 'moderate',
    goal: 'maintenance',
    isPregnant: false,
    isLactating: false,
  });

  // Load saved targets and profile data on mount
  useEffect(() => {
    async function loadData() {
      if (!user?.uid) {
        setIsLoading(false);
        return;
      }

      try {
        const db = getDb();

        // First, try to load saved nutrition targets
        const targetsRef = doc(db, 'patients', user.uid, 'nutritionTargets', 'current');
        const targetsSnap = await getDoc(targetsRef);

        if (targetsSnap.exists()) {
          const savedData = targetsSnap.data();
          // We have saved targets - show the report directly
          setResults(savedData as UserNutritionTargets);
          setHasSavedTargets(true);
          setHasUnsavedChanges(false);

          // Load the saved input values into form
          if (savedData.sourceProfile) {
            const sp = savedData.sourceProfile;
            setFormData({
              dateOfBirth: sp.dateOfBirth ?? '1990-01-01',
              sex: sp.sex ?? 'male',
              weightKg: sp.weightKg?.toString() ?? '',
              heightCm: sp.heightCm?.toString() ?? '',
              activityLevel: sp.activityLevel ?? 'moderate',
              goal: sp.goal ?? 'maintenance',
              isPregnant: sp.isPregnant ?? false,
              isLactating: sp.isLactating ?? false,
            });
          }
        } else {
          // No saved targets - load from patient profile as defaults
          const profileRef = doc(db, 'patients', user.uid);
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            const data = profileSnap.data();
            setFormData((prev) => ({
              ...prev,
              dateOfBirth: data.dateOfBirth ?? prev.dateOfBirth,
              sex: data.gender === 'female' ? 'female' : data.sex ?? prev.sex,
              weightKg: data.weight?.toString() ?? prev.weightKg,
              heightCm: data.height?.toString() ?? prev.heightCm,
              activityLevel: data.activityLevel ?? prev.activityLevel,
              goal: data.dietaryGoals?.[0]?.toLowerCase().replace(/\s+/g, '_') ?? prev.goal,
              isPregnant: data.isPregnant ?? false,
              isLactating: data.isLactating ?? false,
            }));
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [user?.uid]);

  // Calculate age from DOB
  const age = useMemo(() => {
    if (!formData.dateOfBirth) return null;
    return calculateAge(formData.dateOfBirth);
  }, [formData.dateOfBirth]);

  // Calculate personalized targets
  const handleCalculate = async () => {
    if (!user?.uid) return;

    setIsCalculating(true);
    setError(null);

    try {
      const profile: NutritionProfile = {
        userId: user.uid,
        dateOfBirth: formData.dateOfBirth,
        sex: formData.sex,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
        heightCm: formData.heightCm ? parseFloat(formData.heightCm) : undefined,
        activityLevel: formData.activityLevel,
        goal: formData.goal,
        isPregnant: formData.sex === 'female' ? formData.isPregnant : undefined,
        isLactating: formData.sex === 'female' ? formData.isLactating : undefined,
      };

      const functions = getFunctions();
      const getNutritionTargets = httpsCallable<{ profile: NutritionProfile }, { success: boolean; targets: UserNutritionTargets }>(
        functions,
        'getNutritionTargets'
      );

      const response = await getNutritionTargets({ profile });

      if (response.data.success && response.data.targets) {
        setResults(response.data.targets);
        setIsEditing(false);
        setHasUnsavedChanges(true); // New calculation needs saving
      } else {
        setError('Failed to calculate targets. Please try again.');
      }
    } catch (err) {
      console.error('Error calculating targets:', err);
      setError('An error occurred while calculating your targets.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Save results to Firebase
  const handleSave = async () => {
    if (!user?.uid || !results) return;

    setIsSaving(true);

    try {
      const db = getDb();
      const targetsRef = doc(db, 'patients', user.uid, 'nutritionTargets', 'current');

      await setDoc(targetsRef, {
        ...results,
        sourceProfile: {
          dateOfBirth: formData.dateOfBirth,
          sex: formData.sex,
          weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          heightCm: formData.heightCm ? parseFloat(formData.heightCm) : null,
          activityLevel: formData.activityLevel,
          goal: formData.goal,
          isPregnant: formData.isPregnant,
          isLactating: formData.isLactating,
        },
        updatedAt: new Date(),
      });

      setHasSavedTargets(true);
      setHasUnsavedChanges(false);
      onSaved?.();
    } catch (err) {
      console.error('Error saving targets:', err);
      setError('Failed to save your targets. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Special nutrient handling
  const SPECIAL_NUTRIENTS: Record<string, {
    type: TagType;
    recommendation?: string;
    value?: number;
    unit?: string;
    source?: string;
  }> = {
    trans_fat: { type: 'Limit', recommendation: 'Minimize (0g ideal)', source: 'FDA/AHA' },
    total_sugars: { type: 'No DV', recommendation: 'No DV established', source: 'FDA' },
    epa_dha: { type: 'Expert', value: 500, unit: 'mg', source: 'AHA' },
  };

  // Get tag type for a nutrient
  const getTagType = (nutrient: NutrientTarget | undefined, nutrientId: string): TagType => {
    const special = SPECIAL_NUTRIENTS[nutrientId];
    if (special) return special.type;
    if (nutrient?.cdrrLimit) return 'CDRR';
    if (nutrient?.targetType === 'RDA') return 'RDA';
    if (nutrient?.targetType === 'AI') return 'AI';
    if (nutrient?.amdrMinPercent !== undefined || nutrient?.amdrMaxPercent !== undefined) return 'AMDR';
    return 'RDA'; // Default
  };

  // Render a single nutrient row
  const renderNutrientRow = (
    nutrientId: string,
    nutrients: Record<string, NutrientTarget>
  ): React.ReactElement | null => {
    const nutrient = nutrients[nutrientId];
    const special = SPECIAL_NUTRIENTS[nutrientId];

    // Special handling for nutrients with no DV or special recommendations
    if (special) {
      const tagConfig = TAG_CONFIGS[special.type];
      return (
        <div
          key={nutrientId}
          className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-xs text-text-primary truncate">{formatNutrientName(nutrientId)}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${tagConfig.bg} ${tagConfig.text} font-medium shrink-0`}>
              {tagConfig.label}
            </span>
          </div>
          <div className="text-right shrink-0 ml-2">
            {special.value !== undefined ? (
              <>
                <span className="text-xs font-semibold text-text-primary">
                  {special.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-text-muted ml-1">{formatUnit(special.unit ?? '')}</span>
              </>
            ) : (
              <span className={`text-xs font-semibold ${special.type === 'Limit' ? 'text-red-400' : 'text-text-muted'}`}>
                {special.recommendation}
              </span>
            )}
            {special.source && (
              <div className={`text-[9px] ${tagConfig.text}`}>{special.source}</div>
            )}
          </div>
        </div>
      );
    }

    if (!nutrient) return null;

    const value = nutrient.target ?? nutrient.dailyValue;
    if (value === undefined || value === null) return null;

    const tagType = getTagType(nutrient, nutrientId);
    const tagConfig = TAG_CONFIGS[tagType];

    // Check if this is a "limit" nutrient (should be kept below)
    const isLimitNutrient = ['saturated_fat', 'sodium', 'added_sugars'].includes(nutrientId);

    return (
      <div
        key={nutrientId}
        className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs text-text-primary truncate">{formatNutrientName(nutrientId)}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded ${tagConfig.bg} ${tagConfig.text} font-medium shrink-0`}>
            {tagConfig.label}
          </span>
          {isLimitNutrient && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 shrink-0">
              ↓ limit
            </span>
          )}
        </div>
        <div className="text-right shrink-0 ml-2">
          <span className="text-xs font-semibold text-text-primary">
            {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : value}
          </span>
          <span className="text-[10px] text-text-muted ml-1">{formatUnit(nutrient.unit)}</span>
          {nutrient.upperLimit && (
            <div className="text-[9px] text-amber-400 flex items-center justify-end gap-1">
              <AlertTriangle size={9} />
              UL: {nutrient.upperLimit.toLocaleString()}
            </div>
          )}
          {(nutrient.amdrMinPercent !== undefined || nutrient.amdrMaxPercent !== undefined) && (
            <div className="text-[9px] text-purple-400">
              {nutrient.amdrMinPercent !== undefined && nutrient.amdrMaxPercent !== undefined
                ? `${nutrient.amdrMinPercent}-${nutrient.amdrMaxPercent}% cal`
                : nutrient.amdrMaxPercent !== undefined
                ? `<${nutrient.amdrMaxPercent}% cal`
                : `>${nutrient.amdrMinPercent}% cal`}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render a section of nutrients
  const renderNutrientSection = (group: NutrientGroupConfig, nutrients: Record<string, NutrientTarget>): React.ReactElement | null => {
    const Icon = group.icon;
    const renderedNutrients = group.nutrients
      .map((id) => renderNutrientRow(id, nutrients))
      .filter(Boolean);

    if (renderedNutrients.length === 0) return null;

    return (
      <div key={group.title} className="border-t border-white/[0.06] pt-3 first:border-0 first:pt-0">
        <div className="flex items-center gap-2 mb-2">
          <div style={{ color: group.iconColor }}>
            <Icon size={12} />
          </div>
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
            {group.title}
          </span>
        </div>
        <div className="space-y-0">{renderedNutrients}</div>
      </div>
    );
  };

  // Legend component
  const renderLegend = (): React.ReactElement => (
    <div className="mt-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
      <button
        onClick={() => setShowLegend(!showLegend)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-violet-400" />
          <span className="text-xs font-medium text-text-primary">Understanding Your Values</span>
        </div>
        <span className="text-[10px] text-text-muted">
          {showLegend ? 'Hide' : 'Show'} legend
        </span>
      </button>

      {showLegend && (
        <div className="mt-4 space-y-3">
          {/* Tag explanations */}
          <div className="space-y-2">
            <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Value Types
            </div>
            {Object.entries(TAG_CONFIGS).map(([key, config]) => (
              <div key={key} className="flex items-start gap-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${config.bg} ${config.text} font-medium shrink-0 mt-0.5`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-text-muted leading-relaxed">
                  {config.description}
                </span>
              </div>
            ))}
          </div>

          {/* Additional explanations */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Additional Notes
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                ↓ limit
              </span>
              <span className="text-[10px] text-text-muted leading-relaxed">
                Nutrients to keep below the target for optimal health
              </span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-[10px] text-text-muted leading-relaxed">
                <strong className="text-amber-400">UL</strong> = Upper Limit - do not exceed this amount
              </span>
            </div>
          </div>

          {/* Sources */}
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">
              Data Sources
            </div>
            <div className="text-[10px] text-text-muted leading-relaxed space-y-1">
              <p>• <strong>DRI</strong>: Dietary Reference Intakes from the National Academies of Sciences</p>
              <p>• <strong>FDA</strong>: U.S. Food and Drug Administration Daily Values (21 CFR 101.9)</p>
              <p>• <strong>AHA</strong>: American Heart Association recommendations</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="pt-3 border-t border-white/[0.06]">
            <div className="flex items-start gap-2">
              <ShieldCheck size={12} className="text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-text-muted leading-relaxed">
                These values are personalized based on your demographics but are general guidelines.
                Individual needs may vary. Consult a healthcare provider or registered dietitian
                for specific medical nutrition therapy.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.06] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20">
              <Calculator size={18} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">My Daily Values</h2>
              <p className="text-xs text-text-muted">Calculate your personalized nutrition targets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="text-violet-400 animate-spin" />
            </div>
          ) : isEditing || (!results && !hasSavedTargets) ? (
            <>
              {/* Info Banner */}
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-start gap-3">
                <Info size={16} className="text-violet-400 mt-0.5 shrink-0" />
                <p className="text-xs text-violet-300 leading-relaxed">
                  Your Daily Values are calculated based on the DRI (Dietary Reference Intakes) system,
                  personalized for your age, sex, and activity level.
                </p>
              </div>

              {/* Form Sections */}
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <User size={14} className="text-blue-400" />
                    Basic Info
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1.5 block">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary focus:outline-none focus:border-violet-500/50 transition-colors"
                      />
                      {age !== null && (
                        <span className="text-[10px] text-text-muted mt-1 block">{age} years old</span>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-text-muted mb-1.5 block">Sex</label>
                      <div className="flex gap-2">
                        {(['male', 'female'] as const).map((sex) => (
                          <button
                            key={sex}
                            onClick={() => setFormData((prev) => ({ ...prev, sex, isPregnant: false, isLactating: false }))}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${
                              formData.sex === sex
                                ? 'bg-violet-500/20 border border-violet-500/40 text-violet-400'
                                : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06]'
                            }`}
                          >
                            {sex === 'male' ? 'Male' : 'Female'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pregnancy/Lactation for females */}
                  {formData.sex === 'female' && (
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isPregnant}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isPregnant: e.target.checked, isLactating: e.target.checked ? false : prev.isLactating }))}
                          className="w-4 h-4 rounded border-white/20 bg-white/[0.03] text-violet-500 focus:ring-violet-500/50"
                        />
                        <span className="text-xs text-text-muted">Pregnant</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isLactating}
                          onChange={(e) => setFormData((prev) => ({ ...prev, isLactating: e.target.checked, isPregnant: e.target.checked ? false : prev.isPregnant }))}
                          className="w-4 h-4 rounded border-white/20 bg-white/[0.03] text-violet-500 focus:ring-violet-500/50"
                        />
                        <span className="text-xs text-text-muted">Breastfeeding</span>
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1.5 block">Weight</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.weightKg}
                          onChange={(e) => setFormData((prev) => ({ ...prev, weightKg: e.target.value }))}
                          placeholder="62"
                          className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">kg</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-text-muted mb-1.5 block">Height</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.heightCm}
                          onChange={(e) => setFormData((prev) => ({ ...prev, heightCm: e.target.value }))}
                          placeholder="165"
                          className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm bg-white/[0.03] border border-white/[0.06] text-text-primary placeholder-text-muted/50 focus:outline-none focus:border-violet-500/50 transition-colors"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">cm</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Level */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Activity size={14} className="text-emerald-400" />
                    Activity Level
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {ACTIVITY_LEVELS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setFormData((prev) => ({ ...prev, activityLevel: value }))}
                        className={`py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                          formData.activityLevel === value
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                            : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {ACTIVITY_LEVELS.find((l) => l.value === formData.activityLevel)?.description}
                  </p>
                </div>

                {/* Goal */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Target size={14} className="text-amber-400" />
                    Goal
                  </div>

                  <div className="grid grid-cols-5 gap-1.5">
                    {GOALS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setFormData((prev) => ({ ...prev, goal: value }))}
                        className={`py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                          formData.goal === value
                            ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                            : 'bg-white/[0.03] border border-white/[0.06] text-text-muted hover:bg-white/[0.06]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {error}
                </div>
              )}
            </>
          ) : results ? (
            <>
              {/* Results - Non-collapsible comprehensive view */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border border-violet-500/20">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                    Your Personalized Daily Values
                  </span>
                </div>

                {/* Calories Hero */}
                <div className="text-center mb-5 pb-5 border-b border-white/[0.08]">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Flame size={24} className="text-amber-400" />
                    <span className="text-5xl font-black text-white">{results.calories.toLocaleString()}</span>
                  </div>
                  <span className="text-sm text-text-muted">calories per day</span>
                  <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-text-muted">
                    <span className="font-medium text-text-secondary">
                      {results.profile.ageYears}{results.profile.sex === 'male' ? 'M' : 'F'}
                    </span>
                    <span className="text-text-muted/50">•</span>
                    <span className="capitalize">{results.profile.lifeStageGroup.replace(/_/g, ' ').replace(/(\d+)\s*(\d+)/g, '$1-$2')}</span>
                    <span className="text-text-muted/50">•</span>
                    <span className="capitalize">{results.profile.activityLevel.replace(/_/g, ' ')} Activity</span>
                  </div>
                </div>

                {/* Primary Macros */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { key: 'protein', icon: Beef, color: '#fb7185', label: 'Protein', calPerGram: 4 },
                    { key: 'carbohydrate', icon: Wheat, color: '#c084fc', label: 'Carbs', calPerGram: 4 },
                    { key: 'total_fat', icon: Droplets, color: '#60a5fa', label: 'Fat', calPerGram: 9 },
                  ].map(({ key, icon: Icon, color, label, calPerGram }) => {
                    const nutrient = results.nutrients[key];
                    if (!nutrient) return null;
                    const value = nutrient.target ?? nutrient.dailyValue ?? 0;
                    // Calculate % of calories from the gram value
                    const caloriesFromMacro = value * calPerGram;
                    const percentOfCalories = Math.round((caloriesFromMacro / results.calories) * 100);
                    // AMDR range - use the percent fields, not the gram fields
                    const amdrRange = nutrient.amdrMinPercent !== undefined && nutrient.amdrMaxPercent !== undefined
                      ? `${nutrient.amdrMinPercent}-${nutrient.amdrMaxPercent}%`
                      : null;
                    return (
                      <div
                        key={key}
                        className="p-3 rounded-xl text-center"
                        style={{
                          backgroundColor: `${color}15`,
                          borderWidth: 1,
                          borderColor: `${color}30`,
                        }}
                      >
                        <Icon size={14} className="mx-auto mb-1" style={{ color }} />
                        <span className="text-lg font-bold block" style={{ color }}>
                          {Math.round(value)}g
                        </span>
                        <span className="text-[10px] text-text-muted block">{label}</span>
                        <span className="text-[9px] text-text-muted/70 block mt-0.5">
                          ~{percentOfCalories}% cal
                          {amdrRange && <span className="text-purple-400/70"> ({amdrRange})</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Fiber highlight */}
                {results.nutrients.fiber && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                    <div className="flex items-center gap-2">
                      <Leaf size={14} className="text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400">Fiber</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                        {results.nutrients.fiber.targetType || 'AI'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400">
                        {Math.round(results.nutrients.fiber.target ?? results.nutrients.fiber.dailyValue ?? 0)}g
                      </span>
                      <span className="text-[10px] text-text-muted ml-1">/day</span>
                    </div>
                  </div>
                )}

                {/* All Nutrient Sections */}
                <div className="space-y-4">
                  {NUTRIENT_GROUPS.map((group) => renderNutrientSection(group, results.nutrients))}
                </div>

                {/* Legend */}
                {renderLegend()}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.06] shrink-0 space-y-3">
          {isEditing || (!results && !hasSavedTargets) ? (
            /* Form mode - show Calculate button */
            <div className="space-y-2">
              <button
                onClick={handleCalculate}
                disabled={isCalculating || !formData.dateOfBirth}
                className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-500 to-purple-500 text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator size={16} />
                    Calculate My Daily Values
                  </>
                )}
              </button>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full py-2.5 rounded-xl font-medium text-xs text-text-muted hover:text-text-primary transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          ) : results ? (
            /* Report mode - show Recalculate and optionally Save */
            <div className="space-y-3">
              {hasUnsavedChanges && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save as My DVs
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-3 rounded-xl font-medium text-sm bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all"
              >
                Recalculate
              </button>
              {hasUnsavedChanges && (
                <p className="text-[10px] text-text-muted text-center">
                  Save to use these values in food comparison and daily tracking
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
