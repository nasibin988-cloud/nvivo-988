/**
 * NutrientInfoModal - Educational modal for nutrient information
 *
 * Shows:
 * - Nutrient name, category, and function
 * - What it does in the body
 * - Signs of deficiency/excess
 * - Top food sources
 * - User's current intake vs target
 *
 * Uses the useNutrientInfo hook which fetches from the Cloud Functions API.
 */

import { X, Info, AlertTriangle, Apple } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNutrientInfo, useNutrientTarget, getNutrientCategoryColor } from '../../../../hooks/nutrition';

interface NutrientInfoModalProps {
  nutrientId: string;
  currentIntake?: number;
  onClose: () => void;
}

export function NutrientInfoModal({
  nutrientId,
  currentIntake,
  onClose,
}: NutrientInfoModalProps): React.ReactElement {
  const { data: info, isLoading, error } = useNutrientInfo(nutrientId);
  const target = useNutrientTarget(nutrientId);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center sm:items-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden border border-white/[0.06] animate-slide-up sm:animate-scale-in">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: info ? `${getNutrientCategoryColor(info.education?.category || 'other')}20` : 'rgba(255,255,255,0.05)',
              }}
            >
              <Info
                size={20}
                style={{
                  color: info ? getNutrientCategoryColor(info.education?.category || 'other') : '#fff',
                }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {isLoading ? 'Loading...' : info?.education?.displayName || nutrientId}
              </h2>
              {info?.education?.category && (
                <span
                  className="text-[10px] font-medium uppercase tracking-wider"
                  style={{ color: getNutrientCategoryColor(info.education.category) }}
                >
                  {info.education.category.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-5 space-y-5">
          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-20 bg-white/5 rounded-xl" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
              <div className="h-16 bg-white/5 rounded-xl" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto mb-3 text-amber-400" size={32} />
              <p className="text-sm text-text-muted">
                Unable to load nutrient information
              </p>
            </div>
          )}

          {info?.education && (
            <>
              {/* Your Intake Card (if provided) */}
              {currentIntake !== undefined && target && (
                <IntakeCard
                  current={currentIntake}
                  target={target.target}
                  upperLimit={target.upperLimit}
                  unit={target.unit}
                />
              )}

              {/* What it does */}
              {info.education.whatItDoes && (
                <Section title="What it does">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {info.education.whatItDoes}
                  </p>
                </Section>
              )}

              {/* Signs of Deficiency */}
              {info.education.deficiencySigns && info.education.deficiencySigns.length > 0 && (
                <Section title="Signs of deficiency" icon={AlertTriangle} iconColor="#f59e0b">
                  <ul className="space-y-1.5">
                    {info.education.deficiencySigns.map((sign: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Toxicity Risks (if upper limit exists) */}
              {info.education.toxicityRisks && info.education.toxicityRisks.length > 0 && (
                <Section title="Signs of excess" icon={AlertTriangle} iconColor="#ef4444">
                  <ul className="space-y-1.5">
                    {info.education.toxicityRisks.map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Food Sources */}
              {info.education.foodSources && info.education.foodSources.length > 0 && (
                <Section title="Good food sources" icon={Apple} iconColor="#10b981">
                  <div className="flex flex-wrap gap-2">
                    {info.education.foodSources.slice(0, 8).map((food, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400"
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </Section>
              )}

              {/* Target Info */}
              {target && (
                <Section title="Daily target">
                  <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06]">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {target.target && (
                        <div>
                          <span className="text-text-muted block mb-0.5">
                            {target.targetType || 'Recommended'}
                          </span>
                          <span className="text-text-primary font-semibold">
                            {target.target} {target.unit}
                          </span>
                        </div>
                      )}
                      {target.upperLimit && (
                        <div>
                          <span className="text-text-muted block mb-0.5">Upper Limit</span>
                          <span className="text-amber-400 font-semibold">
                            {target.upperLimit} {target.unit}
                          </span>
                        </div>
                      )}
                      {target.dailyValue && (
                        <div>
                          <span className="text-text-muted block mb-0.5">Daily Value (%DV)</span>
                          <span className="text-text-primary font-semibold">
                            {target.dailyValue} {target.unit}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted mt-2">
                      Source: {target.source || 'DRI Reference Data'}
                    </p>
                  </div>
                </Section>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-text-muted/60 leading-relaxed pt-2 border-t border-white/[0.04]">
                This information is for educational purposes only and is not medical advice.
                Consult a healthcare provider for personalized nutrition guidance.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface SectionProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, iconColor, children }: SectionProps): React.ReactElement {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} color={iconColor} />}
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

interface IntakeCardProps {
  current: number;
  target?: number;
  upperLimit?: number;
  unit: string;
}

function IntakeCard({ current, target, upperLimit, unit }: IntakeCardProps): React.ReactElement {
  const percentage = target ? Math.round((current / target) * 100) : null;
  const limitPercentage = upperLimit ? Math.round((current / upperLimit) * 100) : null;

  const isAtTarget = percentage !== null && percentage >= 80 && percentage <= 120;
  const isOverLimit = limitPercentage !== null && limitPercentage > 100;
  const isLow = percentage !== null && percentage < 50;

  let statusColor = '#6b7280'; // gray
  let statusText = 'No target data';
  let statusBg = 'bg-gray-500/10';

  if (isOverLimit) {
    statusColor = '#ef4444';
    statusText = 'Over limit';
    statusBg = 'bg-red-500/10';
  } else if (isAtTarget) {
    statusColor = '#10b981';
    statusText = 'On target';
    statusBg = 'bg-emerald-500/10';
  } else if (isLow) {
    statusColor = '#f59e0b';
    statusText = 'Below target';
    statusBg = 'bg-amber-500/10';
  } else if (percentage !== null) {
    statusColor = '#3b82f6';
    statusText = 'Getting there';
    statusBg = 'bg-blue-500/10';
  }

  return (
    <div className={`rounded-xl p-4 border ${statusBg}`} style={{ borderColor: `${statusColor}30` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-muted">Your intake today</span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
        >
          {statusText}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-text-primary">{Math.round(current)}</span>
        {target && (
          <span className="text-sm text-text-muted">/ {target} {unit}</span>
        )}
      </div>
      {percentage !== null && (
        <div className="mt-2">
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: statusColor,
              }}
            />
          </div>
          <span className="text-[10px] text-text-muted mt-1 block">
            {percentage}% of daily target
          </span>
        </div>
      )}
    </div>
  );
}
