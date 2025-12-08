/**
 * Care Screen with Sub-tabs
 * Tabs: Care Team, Scheduler, Telehealth, Messaging, Family Hub
 */

import { useState } from 'react';
import { Users, Calendar, Video, MessageSquare, Heart } from 'lucide-react';
import CareTeamTab from './CareTeamTab';
import SchedulerTab from './SchedulerTab';
import TelehealthTab from './TelehealthTab';
import MessagingTab from './MessagingTab';
import FamilyHubTab from './FamilyHubTab';
import TabBanner from '../../components/layout/TabBanner';

type CareTab = 'team' | 'scheduler' | 'telehealth' | 'messaging' | 'family';

const tabs: { id: CareTab; label: string; icon: typeof Users }[] = [
  { id: 'team', label: 'Care Team', icon: Users },
  { id: 'scheduler', label: 'Scheduler', icon: Calendar },
  { id: 'telehealth', label: 'Telehealth', icon: Video },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare },
  { id: 'family', label: 'Family Hub', icon: Heart },
];

export default function CareScreen() {
  const [activeTab, setActiveTab] = useState<CareTab>('team');

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <TabBanner tab="care" design={2} />

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
                    ? 'bg-accent/15 border border-accent/30 text-accent'
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
        {activeTab === 'team' && <CareTeamTab />}
        {activeTab === 'scheduler' && <SchedulerTab />}
        {activeTab === 'telehealth' && <TelehealthTab />}
        {activeTab === 'messaging' && <MessagingTab />}
        {activeTab === 'family' && <FamilyHubTab />}
      </div>
    </div>
  );
}
