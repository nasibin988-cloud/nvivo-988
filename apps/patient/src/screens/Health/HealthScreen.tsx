/**
 * Health Screen with Sub-tabs
 * Tabs: Overview, Trends, Imaging, Wearables, Journey
 */

import { useState } from 'react';
import { Activity, TrendingUp, FileText, Watch, MapPin } from 'lucide-react';
import TabBanner from '../../components/layout/TabBanner';
import { OverviewTab, TrendsTab, ImagingTab, WearablesTab, JourneyTab } from './tabs';
import GoalsProgress from './GoalsProgress';

type HealthTab = 'overview' | 'trends' | 'imaging' | 'wearables' | 'journey';
type SubView = 'main' | 'goals';

const tabs: { id: HealthTab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'imaging', label: 'Imaging', icon: FileText },
  { id: 'wearables', label: 'Wearables', icon: Watch },
  { id: 'journey', label: 'Journey', icon: MapPin },
];

export default function HealthScreen() {
  const [activeTab, setActiveTab] = useState<HealthTab>('overview');
  const [subView, setSubView] = useState<SubView>('main');

  // Handle sub-view navigation
  if (subView === 'goals') {
    return <GoalsProgress onBack={() => setSubView('main')} />;
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <TabBanner tab="health" design={2} />

      {/* Tab Navigation */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-5 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                    : 'bg-surface border border-border text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                <Icon size={16} />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-2">
        {activeTab === 'overview' && (
          <OverviewTab onOpenGoals={() => setSubView('goals')} />
        )}
        {activeTab === 'trends' && <TrendsTab />}
        {activeTab === 'imaging' && <ImagingTab />}
        {activeTab === 'wearables' && <WearablesTab />}
        {activeTab === 'journey' && <JourneyTab />}
      </div>
    </div>
  );
}
