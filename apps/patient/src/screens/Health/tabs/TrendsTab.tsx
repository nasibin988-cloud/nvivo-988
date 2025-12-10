/**
 * Health Trends Tab
 * Categories: Sleep, Cardio, Cognitive, Metabolic, Activity, Biomarkers, Labs
 * Modularized version - main orchestrator component
 */

import { useState, useMemo } from 'react';
import { Loader2, FileText, ChevronRight } from 'lucide-react';
import { useHealthTrends, type TimeRange } from '../../../hooks/dashboard';

// Types and configuration
import {
  type SubTab,
  type MetricCardProps,
  subtabs,
  categoryColors,
  TEST_PATIENT_ID,
} from '../trends/types';

// Metric configurations
import {
  sleepMetricConfigs,
  cardioMetricConfigs,
  cognitiveMetricConfigs,
  metabolicMetricConfigs,
  activityMetricConfigs,
  biomarkerMetricConfigs,
} from '../trends/metricConfigs';

// Utilities
import { buildMetricProps } from '../trends/utils';

// Chart components
import { MetricCard } from '../trends/charts';

// Components
import { NvivoInsight } from '../trends/components';

// Labs module
import {
  type LabPanel,
  currentLabPanels,
  LabPanelCard,
  LabDetailModal,
  LabHistoryModal,
} from '../trends/labs';

const timeRanges: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y'];

export default function TrendsTab(): React.ReactElement {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('sleep');
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [showLabHistory, setShowLabHistory] = useState(false);
  const [selectedLabPanel, setSelectedLabPanel] = useState<LabPanel | null>(null);

  const { data: trendsData, isLoading } = useHealthTrends(TEST_PATIENT_ID, timeRange);

  // Build metrics - pass timeRange to get appropriate data point count
  const sleepMetrics = useMemo(
    () => sleepMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)),
    [trendsData, timeRange]
  );
  const cardioMetrics = useMemo(
    () => cardioMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)),
    [trendsData, timeRange]
  );
  const cognitiveMetrics = useMemo(
    () => cognitiveMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)),
    [trendsData, timeRange]
  );
  const metabolicMetrics = useMemo(
    () => metabolicMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)),
    [trendsData, timeRange]
  );
  const activityMetrics = useMemo(
    () => activityMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)),
    [trendsData, timeRange]
  );
  const biomarkerMetrics = useMemo(
    () => biomarkerMetricConfigs.map((c) => buildMetricProps(c, trendsData, timeRange)),
    [trendsData, timeRange]
  );

  const LoadingOverlay = (): React.ReactElement => (
    <div className="absolute inset-0 bg-surface/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
      <Loader2 size={20} className="animate-spin text-text-muted" />
    </div>
  );

  const renderMetrics = (metrics: MetricCardProps[]): React.ReactElement => (
    <div className="space-y-3">
      <div className="relative">
        {isLoading && <LoadingOverlay />}
        <div className="space-y-3">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>
      <NvivoInsight category={activeSubTab} color={categoryColors[activeSubTab]} />
    </div>
  );

  const renderContent = (): React.ReactElement | null => {
    switch (activeSubTab) {
      case 'sleep':
        return renderMetrics(sleepMetrics);
      case 'cardio':
        return renderMetrics(cardioMetrics);
      case 'cognitive':
        return renderMetrics(cognitiveMetrics);
      case 'metabolic':
        return renderMetrics(metabolicMetrics);
      case 'activity':
        return renderMetrics(activityMetrics);
      case 'biomarkers':
        return renderMetrics(biomarkerMetrics);
      case 'labs':
        return (
          <div className="space-y-4">
            {/* Lab Panels - show latest of each type */}
            {currentLabPanels.map((panel) => (
              <LabPanelCard
                key={panel.id}
                panel={panel}
                onViewDetails={() => setSelectedLabPanel(panel)}
              />
            ))}

            {/* View History Button */}
            <button
              onClick={() => setShowLabHistory(true)}
              className="w-full py-3 bg-transparent border border-border hover:border-text-muted text-text-secondary text-sm font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <FileText size={16} />
              View Full Lab History
              <ChevronRight size={16} />
            </button>

            <NvivoInsight category="labs" color={categoryColors.labs} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Subtab Navigation - Full width grid */}
      <div className="grid grid-cols-7 gap-1 p-1 bg-surface/50 rounded-xl border border-border">
        {subtabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface border border-transparent'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Time Range Selector - hidden on Labs tab */}
      {activeSubTab !== 'labs' && (
        <>
          <div className="flex justify-center gap-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white/10 text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Live data indicator */}
          {trendsData?.hasData && (
            <div className="flex justify-center">
              <span className="text-[10px] text-emerald-400/60 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live data
              </span>
            </div>
          )}
        </>
      )}

      {/* Content */}
      {renderContent()}

      {/* Lab History Modal */}
      <LabHistoryModal
        isOpen={showLabHistory}
        onClose={() => setShowLabHistory(false)}
        onSelectPanel={(panel) => setSelectedLabPanel(panel)}
      />

      {/* Lab Detail Modal */}
      <LabDetailModal
        isOpen={!!selectedLabPanel}
        onClose={() => setSelectedLabPanel(null)}
        panel={selectedLabPanel}
      />
    </div>
  );
}
