export { useStreak, type Streak } from './useStreak';
export { useHealthMetrics, type HealthMetrics } from './useHealthMetrics';
export { useMicroWins, useCompleteMicroWin, type MicroWins, type MicroWinChallenge } from './useMicroWins';
export { useNextAppointment, type Appointment, type AppointmentLocation } from './useNextAppointment';
export { useLatestWellnessLog, useTodayWellnessLog, type WellnessLog } from './useWellnessLog';
export {
  useCardiacHealth,
  type CardiacHealth,
  type PlaqueData,
  type LipidPanel,
  type Metabolic,
  type Biomarkers,
  type TrendDirection,
  type BloodPressureTrend,
  type VitalTrend,
} from './useCardiacHealth';
export {
  useCognitiveHealth,
  type CognitiveHealth,
  type BrainMRI,
  type CognitiveAssessment,
  type StrokeRisk,
  type MentalHealth,
  type DASS21,
  type RiskStatus,
} from './useCognitiveHealth';
export {
  useTodayMedicationStatus,
  type MedicationStatus,
  type MedicationLog,
  type Medication,
} from './useMedicationStatus';
export {
  useTodayFoodLogStatus,
  type FoodLogStatus,
  type FoodLog,
  type MealType,
} from './useFoodLogStatus';
export {
  useHealthTrends,
  getSparklineData,
  calculateTrendChange,
  type TimeRange,
  type MetricCategory,
  type MetricDataPoint,
  type LatestMetric,
  type HealthTrendsData,
} from './useHealthTrends';
