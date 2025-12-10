/**
 * Cognitive Health Panel Utilities
 */

import type { RiskStatus } from '../../../hooks/dashboard';
import type { TrendDirection, DassThresholds, StatusInfo } from './types';

/**
 * Calculate trend direction from data array
 */
export function calculateTrendDirection(data: number[], threshold: number = 0.3): TrendDirection {
  if (data.length < 14) return 'stable';
  const first7Avg = data.slice(0, 7).reduce((a, b) => a + b, 0) / 7;
  const last7Avg = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
  const diff = last7Avg - first7Avg;
  if (diff > threshold) return 'increasing';
  if (diff < -threshold) return 'decreasing';
  return 'stable';
}

/**
 * Format date string to mm/dd/yy format
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

/**
 * Get status label and color based on risk status
 */
export function getStatusLabel(status: RiskStatus): StatusInfo {
  if (status === 'on-target') return { label: 'On Target', color: '#10B981' };
  if (status === 'attention') return { label: 'Attention', color: '#F59E0B' };
  return { label: 'High Risk', color: '#EF4444' };
}

/**
 * Get status background classes based on risk status
 */
export function getStatusBg(status: RiskStatus): string {
  if (status === 'on-target') return 'bg-success-muted border-success/20';
  if (status === 'attention') return 'bg-warning-muted border-warning/20';
  return 'bg-error-muted border-error/20';
}

/**
 * Get DASS-21 severity label based on score and thresholds
 */
export function getDassLabel(score: number, thresholds: DassThresholds): string {
  if (score <= thresholds.normal) return 'Normal';
  if (score <= thresholds.mild) return 'Mild';
  if (score <= thresholds.moderate) return 'Moderate';
  return 'Severe';
}

/**
 * Get DASS-21 color based on score and thresholds
 */
export function getDassColor(score: number, thresholds: DassThresholds): string {
  if (score <= thresholds.normal) return '#10B981'; // success - green
  if (score <= thresholds.mild) return '#06B6D4'; // info - cyan
  if (score <= thresholds.moderate) return '#F59E0B'; // warning - amber
  return '#EF4444'; // error - red
}

/**
 * Generate SVG path from data points with smooth curves
 */
export function generateSvgPath(data: number[], width: number, height: number, minVal: number, maxVal: number): string {
  if (data.length === 0) return '';
  const range = maxVal - minVal || 1;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - minVal) / range) * height;
    return [x, y];
  });

  return points.reduce((acc, [x, y], i, arr) => {
    if (i === 0) return `M ${x},${y}`;
    const [px, py] = arr[i - 1];
    const cp1x = px + (x - px) * 0.25;
    const cp1y = py;
    const cp2x = x - (x - px) * 0.25;
    const cp2y = y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${x},${y}`;
  }, '');
}
