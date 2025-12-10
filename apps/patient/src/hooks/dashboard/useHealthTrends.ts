import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { getDb, createLogger } from '@nvivo/shared';

const log = createLogger('useHealthTrends');

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y';

export type MetricCategory = 'cardio' | 'cognitive' | 'metabolic' | 'lifestyle' | 'biomarkers';

export interface MetricDataPoint {
  date: string;
  value: number;
}

export interface LatestMetric {
  value: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
}

export interface HealthTrendsData {
  // Data points by metric ID and date range
  metrics: Record<string, MetricDataPoint[]>;
  // Latest values for each metric
  latest: Record<string, LatestMetric>;
  // Whether data was loaded
  hasData: boolean;
}

/**
 * Get the start date for a time range
 */
function getStartDate(timeRange: TimeRange): Date {
  const now = new Date();
  switch (timeRange) {
    case '1W':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '1M':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3M':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '6M':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '1Y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Hook to fetch health trends data from Firebase
 */
export function useHealthTrends(patientId: string | null, timeRange: TimeRange = '1M') {
  return useQuery({
    queryKey: ['healthTrends', patientId, timeRange],
    queryFn: async (): Promise<HealthTrendsData> => {
      if (!patientId) {
        return { metrics: {}, latest: {}, hasData: false };
      }

      const db = getDb();
      const startDate = getStartDate(timeRange);
      const startDateStr = formatDate(startDate);
      const endDateStr = formatDate(new Date());

      // Fetch latest metrics first
      const latestRef = doc(db, 'patients', patientId, 'healthTrends', '_latest');
      const latestSnapshot = await getDoc(latestRef);
      const latestData = latestSnapshot.exists()
        ? (latestSnapshot.data().metrics as Record<string, LatestMetric>)
        : {};

      // Query documents within the date range
      const trendsRef = collection(db, 'patients', patientId, 'healthTrends');
      const q = query(
        trendsRef,
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);

      // Process results into metrics by ID
      const metrics: Record<string, MetricDataPoint[]> = {};

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.date && data.metrics) {
          const date = data.date as string;
          const docMetrics = data.metrics as Record<string, number>;

          // Add each metric value to its array
          Object.entries(docMetrics).forEach(([metricId, value]) => {
            if (!metrics[metricId]) {
              metrics[metricId] = [];
            }
            metrics[metricId].push({ date, value });
          });
        }
      });

      log.debug('Fetched data', {
        patientId,
        timeRange,
        startDate: startDateStr,
        documentCount: snapshot.size,
        metricCount: Object.keys(metrics).length,
      });

      return {
        metrics,
        latest: latestData,
        hasData: snapshot.size > 0,
      };
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });
}

/**
 * Get sparkline data for a specific metric
 */
export function getSparklineData(
  data: HealthTrendsData | undefined,
  metricId: string,
  maxPoints: number = 14
): number[] {
  if (!data?.metrics?.[metricId]) {
    return [];
  }

  const points = data.metrics[metricId];

  // If we have more points than needed, sample evenly
  if (points.length > maxPoints) {
    const step = Math.floor(points.length / maxPoints);
    const sampled: number[] = [];
    for (let i = 0; i < points.length; i += step) {
      sampled.push(points[i].value);
      if (sampled.length >= maxPoints) break;
    }
    return sampled;
  }

  return points.map((p) => p.value);
}

/**
 * Calculate trend change between first and last data points
 */
export function calculateTrendChange(
  data: HealthTrendsData | undefined,
  metricId: string
): { value: number; direction: 'up' | 'down' | 'stable' } {
  if (!data?.metrics?.[metricId] || data.metrics[metricId].length < 2) {
    return { value: 0, direction: 'stable' };
  }

  const points = data.metrics[metricId];
  const first = points[0].value;
  const last = points[points.length - 1].value;
  const diff = last - first;
  const percentChange = Math.abs(diff / first) * 100;

  // Consider stable if less than 2% change
  if (percentChange < 2) {
    return { value: 0, direction: 'stable' };
  }

  return {
    value: Math.round(diff * 10) / 10,
    direction: diff > 0 ? 'up' : 'down',
  };
}
