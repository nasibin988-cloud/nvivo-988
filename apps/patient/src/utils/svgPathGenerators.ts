/**
 * SVG path generation utilities for charts and visualizations
 */

import { trendChartConfig } from '../constants/chartConfig';

interface Point {
  x: number;
  y: number;
}

/**
 * Generate a smooth bezier curve path through a set of points
 * Uses cubic bezier curves for smooth transitions
 */
export function getSmoothPath(
  points: Point[],
  tension: number = trendChartConfig.bezierTension
): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

/**
 * Generate points for a trend line from data values
 */
export function generateTrendPoints(
  values: number[],
  width: number,
  height: number,
  padding: { top: number; bottom: number; left: number; right: number } = { top: 10, bottom: 10, left: 5, right: 5 }
): Point[] {
  if (values.length === 0) return [];

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  return values.map((value, index) => ({
    x: padding.left + (index / (values.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((value - minVal) / range) * chartHeight,
  }));
}

/**
 * Generate a closed area path for filled charts
 */
export function getAreaPath(
  points: Point[],
  height: number,
  baseY?: number
): string {
  if (points.length < 2) return '';

  const smoothPath = getSmoothPath(points);
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const bottom = baseY ?? height;

  return `${smoothPath} L ${lastPoint.x} ${bottom} L ${firstPoint.x} ${bottom} Z`;
}

/**
 * Generate arc path for circular progress/ring charts
 */
export function getArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ');
}

/**
 * Convert polar coordinates to cartesian
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): Point {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

/**
 * Calculate the circumference of a circle
 */
export function getCircumference(radius: number): number {
  return 2 * Math.PI * radius;
}

/**
 * Calculate stroke-dashoffset for progress rings
 */
export function getProgressOffset(
  progress: number,
  circumference: number,
  maxProgress: number = 100
): number {
  const normalizedProgress = Math.min(Math.max(progress, 0), maxProgress);
  return circumference - (normalizedProgress / maxProgress) * circumference;
}
