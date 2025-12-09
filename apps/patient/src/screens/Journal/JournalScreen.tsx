/**
 * Journal Screen with Sub-tabs
 * Tabs: Wellness, Nutrition, Activity, Medications, Assessments
 */

import { useState } from 'react';
import { Smile, Apple, Dumbbell, Pill, ClipboardList } from 'lucide-react';
import TabBanner from '../../components/layout/TabBanner';
import WellnessTab from './tabs/WellnessTab';
import NutritionTab from './tabs/NutritionTab';
import ActivityTab from './tabs/ActivityTab';
import MedicationsTab from './tabs/MedicationsTab';
import AssessmentsTab from './tabs/AssessmentsTab';

type JournalTab = 'wellness' | 'nutrition' | 'activity' | 'medications' | 'assessments';

const tabs: { id: JournalTab; label: string; icon: typeof Smile }[] = [
  { id: 'wellness', label: 'Wellness', icon: Smile },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'activity', label: 'Activity', icon: Dumbbell },
  { id: 'medications', label: 'Meds', icon: Pill },
  { id: 'assessments', label: 'Assess', icon: ClipboardList },
];

export default function JournalScreen() {
  const [activeTab, setActiveTab] = useState<JournalTab>('wellness');

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <TabBanner tab="journal" design={2} />

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
                    ? 'bg-violet-500/15 border border-violet-500/30 text-violet-400'
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
        {activeTab === 'wellness' && <WellnessTab />}
        {activeTab === 'nutrition' && <NutritionTab />}
        {activeTab === 'activity' && <ActivityTab />}
        {activeTab === 'medications' && <MedicationsTab />}
        {activeTab === 'assessments' && <AssessmentsTab />}
      </div>
    </div>
  );
}
