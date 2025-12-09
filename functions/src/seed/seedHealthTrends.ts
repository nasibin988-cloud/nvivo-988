/**
 * Seed Health Trends Data
 *
 * Creates comprehensive health metrics data for the test patient:
 * - Sleep: Duration, Score, Deep Sleep, REM Sleep, Latency, Efficiency
 * - Cardiovascular: RHR, HRV, BP (systolic/diastolic)
 * - Cognitive: Memory, Focus, Processing Speed, Cognitive Age
 * - Metabolic: Fasting Glucose, HbA1c, Weight, BMI
 * - Activity: Steps, Active Minutes, Calories Burned, Exercise Minutes
 * - Biomarkers: LDL, HDL, Triglycerides, hs-CRP, Vitamin D, Ferritin
 *
 * Data is generated for the past 365 days with REALISTIC patterns:
 * - Seasonal variations (winter vs summer for activity/vitamin D)
 * - Weekly patterns (weekday vs weekend for sleep/activity)
 * - Occasional setbacks and plateaus
 * - Holiday dips (around Thanksgiving, Christmas, New Year)
 * - Random fluctuations and life events
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { formatDateYYYYMMDD, getDateDaysAgo } from './utils/dateUtils';

interface SeedHealthTrendsOptions {
  patientId: string;
  daysToSeed?: number; // How many days of history (default: 365)
}

// Pattern types for realistic data generation
type TrendPattern =
  | 'gradual_improve'
  | 'gradual_decline'
  | 'plateau_then_improve'
  | 'improve_then_plateau'
  | 'fluctuating'
  | 'seasonal'
  | 'weekly_cycle'
  | 'setback_recovery'
  | 'stable_with_noise';

interface MetricConfig {
  id: string;
  category: 'cardio' | 'cognitive' | 'metabolic' | 'sleep' | 'activity' | 'biomarkers';
  baseValue: number;
  targetValue: number; // Where we end up after 365 days
  variance: number;
  pattern: TrendPattern;
  unit: string;
  decimals: number;
  dailyFrequency: number; // 1 = daily, 7 = weekly, 30 = monthly
  weekendEffect?: number; // Multiplier for weekends (1 = no effect)
  seasonalAmplitude?: number; // How much seasonal variation (0 = none)
  holidayDip?: number; // % drop during holidays
}

const METRIC_CONFIGS: MetricConfig[] = [
  // Sleep - realistic patterns with weekend effects
  { id: 'sleep_duration', category: 'sleep', baseValue: 6.5, targetValue: 7.3, variance: 0.6, pattern: 'improve_then_plateau', unit: 'hrs', decimals: 1, dailyFrequency: 1, weekendEffect: 1.12 },
  { id: 'sleep_score', category: 'sleep', baseValue: 68, targetValue: 82, variance: 8, pattern: 'setback_recovery', unit: '%', decimals: 0, dailyFrequency: 1, weekendEffect: 1.05 },
  { id: 'deep_sleep', category: 'sleep', baseValue: 1.0, targetValue: 1.5, variance: 0.25, pattern: 'gradual_improve', unit: 'hrs', decimals: 1, dailyFrequency: 1 },
  { id: 'rem_sleep', category: 'sleep', baseValue: 1.5, targetValue: 1.7, variance: 0.35, pattern: 'fluctuating', unit: 'hrs', decimals: 1, dailyFrequency: 1 },
  { id: 'sleep_latency', category: 'sleep', baseValue: 22, targetValue: 12, variance: 6, pattern: 'plateau_then_improve', unit: 'min', decimals: 0, dailyFrequency: 1 },
  { id: 'sleep_efficiency', category: 'sleep', baseValue: 84, targetValue: 92, variance: 4, pattern: 'gradual_improve', unit: '%', decimals: 0, dailyFrequency: 1 },

  // Cardiovascular - gradual improvements with some setbacks
  { id: 'rhr', category: 'cardio', baseValue: 72, targetValue: 64, variance: 4, pattern: 'setback_recovery', unit: 'bpm', decimals: 0, dailyFrequency: 1, seasonalAmplitude: 3 },
  { id: 'hrv', category: 'cardio', baseValue: 35, targetValue: 48, variance: 7, pattern: 'plateau_then_improve', unit: 'ms', decimals: 0, dailyFrequency: 1 },
  { id: 'bp_systolic', category: 'cardio', baseValue: 132, targetValue: 118, variance: 7, pattern: 'improve_then_plateau', unit: 'mmHg', decimals: 0, dailyFrequency: 1 },
  { id: 'bp_diastolic', category: 'cardio', baseValue: 86, targetValue: 78, variance: 4, pattern: 'gradual_improve', unit: 'mmHg', decimals: 0, dailyFrequency: 1 },

  // Cognitive - weekly measurements, fluctuating with overall improvement
  { id: 'memory_score', category: 'cognitive', baseValue: 82, targetValue: 88, variance: 5, pattern: 'fluctuating', unit: '%', decimals: 0, dailyFrequency: 7 },
  { id: 'processing_speed', category: 'cognitive', baseValue: 80, targetValue: 85, variance: 4, pattern: 'stable_with_noise', unit: '%', decimals: 0, dailyFrequency: 7 },
  { id: 'focus_score', category: 'cognitive', baseValue: 65, targetValue: 78, variance: 7, pattern: 'setback_recovery', unit: '%', decimals: 0, dailyFrequency: 7 },
  { id: 'cognitive_age', category: 'cognitive', baseValue: 45, targetValue: 40, variance: 1.5, pattern: 'plateau_then_improve', unit: 'yrs', decimals: 0, dailyFrequency: 30 },

  // Metabolic - weight with holiday effects, glucose fluctuating
  { id: 'fasting_glucose', category: 'metabolic', baseValue: 108, targetValue: 95, variance: 9, pattern: 'fluctuating', unit: 'mg/dL', decimals: 0, dailyFrequency: 1, holidayDip: -8 },
  { id: 'hba1c', category: 'metabolic', baseValue: 5.8, targetValue: 5.4, variance: 0.12, pattern: 'gradual_improve', unit: '%', decimals: 1, dailyFrequency: 90 },
  { id: 'weight', category: 'metabolic', baseValue: 185, targetValue: 172, variance: 1.5, pattern: 'setback_recovery', unit: 'lbs', decimals: 1, dailyFrequency: 1, holidayDip: 3 },
  { id: 'bmi', category: 'metabolic', baseValue: 26.8, targetValue: 24.9, variance: 0.2, pattern: 'setback_recovery', unit: '', decimals: 1, dailyFrequency: 1, holidayDip: 0.4 },

  // Activity - strong seasonal and weekend effects
  { id: 'steps', category: 'activity', baseValue: 5500, targetValue: 8200, variance: 2000, pattern: 'seasonal', unit: 'steps', decimals: 0, dailyFrequency: 1, weekendEffect: 1.25, seasonalAmplitude: 1500, holidayDip: 40 },
  { id: 'active_minutes', category: 'activity', baseValue: 30, targetValue: 55, variance: 12, pattern: 'plateau_then_improve', unit: 'min/day', decimals: 0, dailyFrequency: 1, weekendEffect: 1.3, seasonalAmplitude: 10 },
  { id: 'calories_burned', category: 'activity', baseValue: 1800, targetValue: 2200, variance: 250, pattern: 'seasonal', unit: 'kcal', decimals: 0, dailyFrequency: 1, seasonalAmplitude: 200 },
  { id: 'exercise_minutes', category: 'activity', baseValue: 120, targetValue: 200, variance: 40, pattern: 'setback_recovery', unit: 'min/wk', decimals: 0, dailyFrequency: 7, holidayDip: 50 },

  // Biomarkers - monthly, various patterns
  { id: 'ldl', category: 'biomarkers', baseValue: 138, targetValue: 108, variance: 12, pattern: 'plateau_then_improve', unit: 'mg/dL', decimals: 0, dailyFrequency: 30 },
  { id: 'hdl', category: 'biomarkers', baseValue: 48, targetValue: 56, variance: 4, pattern: 'gradual_improve', unit: 'mg/dL', decimals: 0, dailyFrequency: 30 },
  { id: 'triglycerides', category: 'biomarkers', baseValue: 180, targetValue: 140, variance: 18, pattern: 'fluctuating', unit: 'mg/dL', decimals: 0, dailyFrequency: 30, holidayDip: -15 },
  { id: 'hs_crp', category: 'biomarkers', baseValue: 1.8, targetValue: 0.9, variance: 0.3, pattern: 'improve_then_plateau', unit: 'mg/L', decimals: 1, dailyFrequency: 30 },
  { id: 'vitamin_d', category: 'biomarkers', baseValue: 25, targetValue: 45, variance: 6, pattern: 'seasonal', unit: 'ng/mL', decimals: 0, dailyFrequency: 30, seasonalAmplitude: 12 },
  { id: 'ferritin', category: 'biomarkers', baseValue: 75, targetValue: 80, variance: 10, pattern: 'stable_with_noise', unit: 'ng/mL', decimals: 0, dailyFrequency: 30 },
];

interface DataPoint {
  date: string;
  value: number;
  timestamp: Date;
}

/**
 * Check if a date is during a holiday period
 */
function isHolidayPeriod(date: Date): boolean {
  const month = date.getMonth();
  const day = date.getDate();

  // Thanksgiving week (late November)
  if (month === 10 && day >= 22 && day <= 28) return true;

  // Christmas/New Year (Dec 20 - Jan 5)
  if (month === 11 && day >= 20) return true;
  if (month === 0 && day <= 5) return true;

  return false;
}

/**
 * Get seasonal factor (-1 to 1) based on date
 * Peaks in summer (July), lowest in winter (January)
 */
function getSeasonalFactor(date: Date): number {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  // Peak at day 182 (July 1), trough at day 0/365 (Jan 1)
  return Math.sin((dayOfYear - 91) * (2 * Math.PI / 365));
}

/**
 * Check if date is a weekend
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Generate base progression value based on pattern
 */
function getPatternValue(
  pattern: TrendPattern,
  progress: number, // 0 to 1 (start to end)
  baseValue: number,
  targetValue: number
): number {
  const totalChange = targetValue - baseValue;

  switch (pattern) {
    case 'gradual_improve':
      // Linear progression with slight acceleration at end
      return baseValue + totalChange * Math.pow(progress, 0.9);

    case 'gradual_decline':
      // Linear decline
      return baseValue + totalChange * progress;

    case 'plateau_then_improve':
      // Flat for first 40%, then rapid improvement
      if (progress < 0.4) {
        return baseValue + totalChange * 0.1 * (progress / 0.4);
      }
      return baseValue + totalChange * 0.1 + totalChange * 0.9 * ((progress - 0.4) / 0.6);

    case 'improve_then_plateau':
      // Rapid improvement first 60%, then plateau
      if (progress < 0.6) {
        return baseValue + totalChange * 0.9 * (progress / 0.6);
      }
      return baseValue + totalChange * 0.9 + totalChange * 0.1 * ((progress - 0.6) / 0.4);

    case 'setback_recovery':
      // Improve, then setback around 50%, then strong recovery
      if (progress < 0.35) {
        return baseValue + totalChange * 0.5 * (progress / 0.35);
      }
      if (progress < 0.5) {
        // Setback
        const setbackProgress = (progress - 0.35) / 0.15;
        return baseValue + totalChange * 0.5 - totalChange * 0.25 * setbackProgress;
      }
      // Recovery and beyond
      const recoveryProgress = (progress - 0.5) / 0.5;
      return baseValue + totalChange * 0.25 + totalChange * 0.75 * recoveryProgress;

    case 'fluctuating':
      // Overall trend but with waves
      const baseProgress = baseValue + totalChange * progress;
      const wave = Math.sin(progress * 8 * Math.PI) * totalChange * 0.15;
      return baseProgress + wave;

    case 'seasonal':
      // Strong seasonal component plus mild overall trend
      return baseValue + totalChange * progress * 0.7;

    case 'weekly_cycle':
      // Weekly pattern (handled separately)
      return baseValue + totalChange * progress;

    case 'stable_with_noise':
      // Mostly stable, small improvement
      return baseValue + totalChange * 0.3 * progress;

    default:
      return baseValue + totalChange * progress;
  }
}

/**
 * Generate data points for a metric over time
 */
function generateMetricData(config: MetricConfig, daysToSeed: number): DataPoint[] {
  const dataPoints: DataPoint[] = [];

  for (let daysAgo = daysToSeed; daysAgo >= 0; daysAgo--) {
    // Check if we should record on this day based on frequency
    if (config.dailyFrequency === 1 || daysAgo % config.dailyFrequency === 0) {
      const date = getDateDaysAgo(daysAgo);
      const progress = 1 - (daysAgo / daysToSeed); // 0 at start, 1 at end

      // Get base value from pattern
      let value = getPatternValue(config.pattern, progress, config.baseValue, config.targetValue);

      // Apply seasonal effect
      if (config.seasonalAmplitude && config.seasonalAmplitude > 0) {
        const seasonalFactor = getSeasonalFactor(date);
        value += seasonalFactor * config.seasonalAmplitude;
      }

      // Apply weekend effect
      if (config.weekendEffect && isWeekend(date)) {
        value *= config.weekendEffect;
      }

      // Apply holiday effect
      if (config.holidayDip && isHolidayPeriod(date)) {
        if (config.holidayDip > 0) {
          value += config.holidayDip; // For metrics like weight that increase
        } else {
          value *= (1 + config.holidayDip / 100); // For metrics like steps that decrease by %
        }
      }

      // Add random noise
      const noise = (Math.random() - 0.5) * 2 * config.variance;
      value += noise;

      // Occasional outliers (5% chance)
      if (Math.random() < 0.05) {
        value += (Math.random() - 0.5) * config.variance * 2;
      }

      // Round to specified decimals
      const roundedValue = Number(value.toFixed(config.decimals));

      dataPoints.push({
        date: formatDateYYYYMMDD(date),
        value: roundedValue,
        timestamp: date,
      });
    }
  }

  return dataPoints;
}

/**
 * Seed health trends data
 */
export async function seedHealthTrends(options: SeedHealthTrendsOptions): Promise<void> {
  const { patientId, daysToSeed = 365 } = options;
  const db = getFirestore();

  console.log(`Seeding health trends for patient ${patientId} (${daysToSeed} days)...`);

  const healthTrendsRef = db.collection('patients').doc(patientId).collection('healthTrends');

  // Generate all metric data
  const allMetricData: Record<string, DataPoint[]> = {};

  for (const config of METRIC_CONFIGS) {
    allMetricData[config.id] = generateMetricData(config, daysToSeed);
    console.log(`  Generated ${allMetricData[config.id].length} data points for ${config.id}`);
  }

  // Store by date for efficient queries
  const dataByDate: Record<string, Record<string, number>> = {};

  for (const [metricId, dataPoints] of Object.entries(allMetricData)) {
    for (const point of dataPoints) {
      if (!dataByDate[point.date]) {
        dataByDate[point.date] = {};
      }
      dataByDate[point.date][metricId] = point.value;
    }
  }

  // Batch write data (Firestore has a 500 document limit per batch)
  const dates = Object.keys(dataByDate).sort();
  const batchSize = 400;

  for (let i = 0; i < dates.length; i += batchSize) {
    const batch = db.batch();
    const batchDates = dates.slice(i, i + batchSize);

    for (const dateStr of batchDates) {
      const docRef = healthTrendsRef.doc(dateStr);
      batch.set(docRef, {
        date: dateStr,
        metrics: dataByDate[dateStr],
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log(`  Committed batch ${Math.floor(i / batchSize) + 1} (${batchDates.length} documents)`);
  }

  // Also store metric configs for reference
  await healthTrendsRef.doc('_config').set({
    metrics: METRIC_CONFIGS.map(c => ({
      id: c.id,
      category: c.category,
      unit: c.unit,
      decimals: c.decimals,
    })),
    lastSeeded: FieldValue.serverTimestamp(),
    daysOfData: daysToSeed,
  });

  // Store latest values for quick access
  const latestData: Record<string, { value: number; trend: string; unit: string }> = {};
  for (const config of METRIC_CONFIGS) {
    const points = allMetricData[config.id];
    if (points.length > 0) {
      const latest = points[points.length - 1].value;
      const weekAgo = points[Math.max(0, points.length - 8)]?.value ?? latest;
      const diff = latest - weekAgo;
      const trendDirection = Math.abs(diff) < config.variance * 0.1 ? 'stable' : diff > 0 ? 'up' : 'down';

      latestData[config.id] = {
        value: latest,
        trend: trendDirection,
        unit: config.unit,
      };
    }
  }

  await healthTrendsRef.doc('_latest').set({
    metrics: latestData,
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`Health trends seeded successfully (${dates.length} date documents)`);
}

/**
 * Clear health trends data
 */
export async function clearHealthTrends(patientId: string): Promise<void> {
  const db = getFirestore();
  const healthTrendsRef = db.collection('patients').doc(patientId).collection('healthTrends');

  const snapshot = await healthTrendsRef.get();
  const batchSize = 400;

  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = db.batch();
    const batchDocs = snapshot.docs.slice(i, i + batchSize);
    batchDocs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log(`Cleared ${snapshot.size} health trends documents for patient ${patientId}`);
}
