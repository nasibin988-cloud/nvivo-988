/**
 * Chart and visualization configuration constants
 */

// Default chart dimensions
export const chartDimensions = {
  default: { width: 300, height: 80 },
  small: { width: 200, height: 60 },
  large: { width: 400, height: 120 },
  mini: { width: 100, height: 40 },
} as const;

// Animation durations (in seconds for CSS)
export const animationDurations = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.5s',
  ring: '1.5s',
  pulse: '2s',
  gradient: '3s',
} as const;

// Animation timing functions
export const animationTimings = {
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const;

// SVG stroke widths
export const strokeWidths = {
  thin: 0.5,
  normal: 1,
  medium: 2,
  thick: 3,
  ring: 8,
  ringLarge: 10,
} as const;

// Opacity values for consistent transparency
export const opacities = {
  subtle: 0.02,
  light: 0.04,
  muted: 0.06,
  soft: 0.1,
  medium: 0.15,
  visible: 0.2,
  prominent: 0.3,
  strong: 0.5,
  heavy: 0.7,
} as const;

// Chart padding/margins
export const chartPadding = {
  top: 10,
  right: 5,
  bottom: 10,
  left: 5,
} as const;

// Vitality ring configuration
export const vitalityRingConfig = {
  defaultSize: 150,
  defaultStrokeWidth: 10,
  scoreMax: 100,
  segments: {
    mood: { startAngle: 0, color: 'mood' },
    energy: { startAngle: 120, color: 'energy' },
    sleep: { startAngle: 240, color: 'sleep' },
  },
} as const;

// Trend chart configuration
export const trendChartConfig = {
  defaultPointCount: 7,
  bezierTension: 0.3,
  areaOpacity: 0.1,
  gradientStops: {
    start: 0.3,
    end: 0,
  },
} as const;

// Progress bar configuration
export const progressConfig = {
  defaultHeight: 4,
  roundedHeight: 6,
  maxValue: 100,
} as const;
