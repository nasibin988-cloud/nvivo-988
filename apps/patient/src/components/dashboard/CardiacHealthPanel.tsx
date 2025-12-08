import { Heart, Activity, Droplets, Beaker, Calendar, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import type { CardiacHealth, TrendDirection } from '../../hooks/dashboard';
import { formatDate } from '../../utils/dateFormatters';
import { colors } from '../../constants/colors';
import { chartDimensions } from '../../constants/chartConfig';

interface CardiacHealthPanelProps {
  data: CardiacHealth | null | undefined;
  onViewMore?: () => void;
}

function getStatusBadge(value: number, target: number, higher: 'good' | 'bad'): { color: string; label: string } {
  if (higher === 'bad') {
    if (value <= target) return { color: colors.success, label: 'On Target' };
    if (value <= target * 1.2) return { color: colors.warning, label: 'Elevated' };
    return { color: colors.error, label: 'High' };
  }
  if (value >= target) return { color: colors.success, label: 'On Target' };
  if (value >= target * 0.8) return { color: colors.warning, label: 'Low' };
  return { color: colors.error, label: 'Very Low' };
}

// Trend label component using centralized colors
function TrendLabel({ direction, color = 'text-text-secondary' }: { direction?: TrendDirection; color?: string }) {
  if (!direction) return null;

  const config: Record<TrendDirection, { icon: typeof TrendingUp; label: string; color: string }> = {
    increasing: { icon: TrendingUp, label: 'Increasing', color: colors.warning },
    decreasing: { icon: TrendingDown, label: 'Decreasing', color: colors.success },
    stable: { icon: Minus, label: 'Stable', color: colors.textSecondary },
  };

  const { icon: Icon, label, color: trendColor } = config[direction];
  const displayColor = color === 'auto' ? trendColor : undefined;

  return (
    <div className={`flex items-center gap-1 ${color !== 'auto' ? color : ''}`} style={displayColor ? { color: displayColor } : undefined}>
      <Icon size={12} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

// Generate smooth SVG path from data points
function getSmoothPath(data: number[], width: number, height: number, maxVal: number, minVal: number = 0): string {
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

// Line graph component for trends
interface TrendLineGraphProps {
  data: number[];
  data2?: number[];
  color: string;
  color2?: string;
  height?: number;
  showArea?: boolean;
  label?: string;
  minLabel?: string;
  maxLabel?: string;
}

function TrendLineGraph({
  data,
  data2,
  color,
  color2,
  height = chartDimensions.default.height,
  showArea = true,
  label,
  minLabel,
  maxLabel,
}: TrendLineGraphProps) {
  if (data.length === 0) {
    return (
      <div className="h-20 flex items-center justify-center text-text-muted text-sm">
        No {label || 'trend'} data available
      </div>
    );
  }

  const allData = [...data, ...(data2 || [])];
  const minVal = Math.min(...allData) * 0.95;
  const maxVal = Math.max(...allData) * 1.05;
  const width = chartDimensions.default.width;
  const path = getSmoothPath(data, width, height, maxVal, minVal);
  const path2 = data2 ? getSmoothPath(data2, width, height, maxVal, minVal) : '';
  const areaPath = `${path} L ${width},${height} L 0,${height} Z`;

  const displayMinLabel = minLabel ?? (Math.floor(minVal / 10) * 10).toString();
  const displayMaxLabel = maxLabel ?? (Math.ceil(maxVal / 10) * 10).toString();

  return (
    <div className="relative" style={{ height }}>
      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between pointer-events-none z-10 py-0.5">
        <span className="text-[9px] text-text-muted/60 leading-none">{displayMaxLabel}</span>
        <span className="text-[9px] text-text-muted/60 leading-none">{displayMinLabel}</span>
      </div>

      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-cardiac-${color}-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`var(--color-${color})`} stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="1" />
          </linearGradient>
          <linearGradient id={`fill-cardiac-${color}-${label}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`var(--color-${color})`} stopOpacity="0.2" />
            <stop offset="100%" stopColor={`var(--color-${color})`} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="0" y1="0" x2={width} y2="0" stroke="var(--color-border)" strokeWidth="0.5" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--color-border)" strokeWidth="0.5" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="var(--color-border)" strokeWidth="0.5" />
        {showArea && (
          <path d={areaPath} fill={`url(#fill-cardiac-${color}-${label})`} stroke="none" />
        )}
        <path d={path} fill="none" stroke={`url(#gradient-cardiac-${color}-${label})`} strokeWidth="2" strokeLinecap="round" />
        {path2 && (
          <path d={path2} fill="none" stroke={`var(--color-${color2 || 'info'})`} strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </div>
  );
}

// Metric Card component
interface MetricCardProps {
  label: string;
  value: number | undefined;
  unit: string;
  target: number;
  higher: 'good' | 'bad';
  icon?: React.ComponentType<Record<string, unknown>>;
  color?: string;
}

function MetricCard({ label, value, unit, target, higher, icon: Icon }: MetricCardProps) {
  const val = value ?? 0;
  const status = getStatusBadge(val, target, higher);

  return (
    <div className="bg-surface-2/40 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2/60 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-theme-sm bg-gradient-to-br from-surface-3/50 to-surface-2/50">
              <Icon size={14} className="text-text-primary" />
            </div>
          )}
          <span className="text-xs text-text-muted font-medium">{label}</span>
        </div>
        <span className="text-xs font-semibold" style={{ color: status.color }}>{status.label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-text-primary">
          {value ?? '—'}
        </span>
        <span className="text-xs text-text-muted">{unit}</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((val / (target * 2)) * 100, 100)}%`,
              backgroundColor: status.color
            }}
          />
        </div>
        <span className="text-xs text-text-tertiary">Target: {higher === 'bad' ? '<' : '>'}{target}</span>
      </div>
    </div>
  );
}

export function CardiacHealthPanel({ data, onViewMore }: CardiacHealthPanelProps) {
  if (!data) {
    return <CardiacHealthPanelSkeleton />;
  }

  const { plaqueData, lipidPanel, biomarkers, bloodPressureTrend, bloodPressureTrendDirection, ldlTrend, ldlTrendDirection, latestBloodPressure } = data;

  const systolicTrend = bloodPressureTrend?.map(t => t.systolic) || [];
  const diastolicTrend = bloodPressureTrend?.map(t => t.diastolic) || [];
  const ldlValues = ldlTrend?.map(t => t.value) || [];

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-cardiac/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />

      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border p-5 shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-cardiac/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-theme-md bg-gradient-to-br from-cardiac/15 to-cardiac/5 border border-cardiac/20 shadow-sm">
                <Heart size={24} className="text-cardiac" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Cardiac Health</h3>
            </div>
            {onViewMore && (
              <button onClick={onViewMore} className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-base">
                View more <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* SECTION 1: Plaque Data (CCTA) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-cardiac" strokeWidth={2.5} />
              <h4 className="text-xs font-bold text-cardiac uppercase tracking-wider">Coronary CT Angiography</h4>
            </div>

            <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h5 className="text-sm font-bold text-text-primary">CCTA Results</h5>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar size={10} className="text-text-muted" />
                    <span className="text-xs text-text-muted">{formatDate(plaqueData?.scanDate)}</span>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-theme-md border border-white/10 bg-surface-2/50">
                  <span className="text-sm font-bold text-text-primary">
                    CAD-RADS {plaqueData?.cadRads ?? '—'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-surface/50 rounded-theme-md">
                  <p className="text-xs text-text-tertiary mb-1">Total Plaque Vol</p>
                  <p className="text-xl font-bold text-text-primary">{plaqueData?.tpv ?? '—'}<span className="text-xs text-text-muted ml-1">mm³</span></p>
                </div>
                <div className="text-center p-3 bg-surface/50 rounded-theme-md">
                  <p className="text-xs text-text-tertiary mb-1">FFR-CT</p>
                  <p className="text-xl font-bold text-text-primary">
                    {plaqueData?.ffr ?? '—'}
                  </p>
                </div>
                <div className="text-center p-3 bg-surface/50 rounded-theme-md">
                  <p className="text-xs text-text-tertiary mb-1">PAV</p>
                  <p className="text-xl font-bold text-text-primary">{plaqueData?.pav ?? '—'}<span className="text-xs text-text-muted ml-1">%</span></p>
                </div>
                <div className="text-center p-3 bg-surface/50 rounded-theme-md">
                  <p className="text-xs text-text-tertiary mb-1">LRNC</p>
                  <p className="text-xl font-bold text-text-primary">
                    {plaqueData?.lrnc ?? '—'}<span className="text-xs text-text-muted ml-1">mm³</span>
                  </p>
                </div>
              </div>

              {plaqueData?.cadRadsDescription && (
                <p className="text-xs text-text-tertiary mt-4 pt-3 border-t border-white/10 leading-relaxed">{plaqueData.cadRadsDescription}</p>
              )}
            </div>
          </div>

          {/* SECTION 2: Lab Results Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Beaker size={16} className="text-text-primary" strokeWidth={2.5} />
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Laboratory Results</h4>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <MetricCard label="LDL Cholesterol" value={lipidPanel?.ldl} unit="mg/dL" target={70} higher="bad" icon={Droplets} color="text-cardiac" />
              <MetricCard label="HDL Cholesterol" value={lipidPanel?.hdl} unit="mg/dL" target={50} higher="good" icon={Droplets} color="text-info" />
              <MetricCard label="Triglycerides" value={lipidPanel?.triglycerides} unit="mg/dL" target={150} higher="bad" icon={Droplets} color="text-warning" />
              <MetricCard label="ApoB" value={biomarkers?.apoB} unit="mg/dL" target={90} higher="bad" icon={Beaker} color="text-info" />
              <MetricCard label="hs-CRP" value={biomarkers?.hsCRP} unit="mg/L" target={1} higher="bad" icon={Beaker} color="text-warning" />
              <MetricCard label="Lp(a)" value={biomarkers?.lpA} unit="nmol/L" target={30} higher="bad" icon={Beaker} color="text-cardiac" />
            </div>
          </div>

          {/* SECTION 3: Trend Graphs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-text-primary" strokeWidth={2.5} />
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Trends</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="text-sm font-bold text-text-primary">Blood Pressure</h5>
                    <p className="text-xs text-text-muted mt-0.5">Last 30 days • {latestBloodPressure ?? '—'} mmHg</p>
                  </div>
                  <TrendLabel direction={bloodPressureTrendDirection} color="auto" />
                </div>
                <TrendLineGraph data={systolicTrend} data2={diastolicTrend} color="error" color2="warning" height={80} label="bp" />
                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-error)' }} />
                    <span>Systolic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: 'var(--color-warning)' }} />
                    <span>Diastolic</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h5 className="text-sm font-bold text-text-primary">LDL Cholesterol</h5>
                    <p className="text-xs text-text-muted mt-0.5">Last year • {lipidPanel?.ldl ?? '—'} mg/dL</p>
                  </div>
                  <TrendLabel direction={ldlTrendDirection} color="auto" />
                </div>
                <TrendLineGraph data={ldlValues} color="error" height={80} label="ldl" />
                <p className="text-xs text-text-muted mt-2">Target: &lt; 70 mg/dL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardiacHealthPanelSkeleton() {
  return (
    <div className="relative">
      <div className="overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-5">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 skeleton rounded-theme-md" />
            <div className="w-48 h-6 skeleton rounded" />
          </div>
          <div className="space-y-3">
            <div className="w-40 h-4 skeleton rounded" />
            <div className="bg-surface-2/50 rounded-theme-lg border border-white/10 p-4">
              <div className="w-32 h-5 skeleton rounded mb-3" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center p-3 bg-surface/50 rounded-theme-md">
                    <div className="w-16 h-3 skeleton rounded mb-1 mx-auto" />
                    <div className="w-12 h-6 skeleton rounded mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 skeleton rounded-theme-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
