/**
 * Rating Slider - Glassmorphism design matching app aesthetic
 */

interface RatingSliderProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  lowLabel?: string;
  highLabel?: string;
}

export function RatingSlider({
  label,
  value,
  onChange,
  color,
  lowLabel = 'Low',
  highLabel = 'High',
}: RatingSliderProps): React.ReactElement {
  const colorMap: Record<string, { text: string; fill: string; glow: string }> = {
    pink: { text: 'text-pink-400', fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.3)' },
    violet: { text: 'text-violet-400', fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.3)' },
    orange: { text: 'text-orange-400', fill: '#f97316', glow: 'rgba(249, 115, 22, 0.3)' },
    cyan: { text: 'text-cyan-400', fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.3)' },
    amber: { text: 'text-amber-400', fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)' },
    emerald: { text: 'text-emerald-400', fill: '#10b981', glow: 'rgba(16, 185, 129, 0.3)' },
    rose: { text: 'text-rose-400', fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.3)' },
  };
  const c = colorMap[color] || colorMap.violet;
  const percentage = ((value - 1) / 9) * 100;

  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-text-primary">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-2xl font-bold ${c.text}`}>{value}</span>
          <span className="text-xs text-text-muted/60">/10</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="slider-glass w-full h-3 rounded-full appearance-none cursor-pointer relative z-10"
          style={{
            background: `linear-gradient(to right, ${c.fill}25 0%, ${c.fill}70 ${percentage}%, rgba(255,255,255,0.04) ${percentage}%)`,
          }}
        />
        <div className="flex justify-between mt-2 px-0.5">
          <span className="text-[10px] text-text-muted/50 font-medium">{lowLabel}</span>
          <span className="text-[10px] text-text-muted/50 font-medium">{highLabel}</span>
        </div>
      </div>
    </div>
  );
}
