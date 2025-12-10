/**
 * CaregiverModeToggle - Toggle between My Family and Caregiving views
 * Shows caregiving targets with health score and alerts
 */

import { Eye, Activity, Pill, ChevronRight } from 'lucide-react';
import type { CaregivingTarget } from '../types';

type ActiveSection = 'members' | 'caregiving';

interface CaregiverModeToggleProps {
  caregivingTargets: CaregivingTarget[];
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  onSelectCaregiver: (id: string) => void;
}

export function CaregiverModeToggle({
  caregivingTargets,
  activeSection,
  onSectionChange,
  onSelectCaregiver,
}: CaregiverModeToggleProps): React.ReactElement | null {
  if (caregivingTargets.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/[0.1] via-surface to-surface-2 border border-violet-500/20 p-4">
      <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/15 border border-violet-500/20">
              <Eye size={18} className="text-violet-400" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Caregiver Mode</h3>
              <p className="text-xs text-text-muted">
                You are caring for {caregivingTargets.length} family members
              </p>
            </div>
          </div>
        </div>

        {/* Toggle between My Family / I'm Caring For */}
        <div className="flex gap-2 p-1 bg-white/[0.04] rounded-xl mb-4">
          <button
            onClick={() => onSectionChange('members')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeSection === 'members'
                ? 'bg-white/[0.08] text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            My Family
          </button>
          <button
            onClick={() => onSectionChange('caregiving')}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
              activeSection === 'caregiving'
                ? 'bg-white/[0.08] text-text-primary'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            I&apos;m Caring For
          </button>
        </div>

        {/* Caring For Cards */}
        {activeSection === 'caregiving' && (
          <div className="space-y-3">
            {caregivingTargets.map((person) => (
              <button
                key={person.id}
                onClick={() => onSelectCaregiver(person.id)}
                className="w-full text-left p-4 rounded-xl bg-surface border border-white/[0.04] hover:bg-surface-2 hover:border-white/[0.08] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={person.avatarUrl}
                      alt={person.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-violet-500/20"
                    />
                    {person.alertCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-surface flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">{person.alertCount}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-text-primary">{person.name}</h4>
                      <span className="text-xs text-text-muted">({person.relationship})</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Activity size={10} className="text-emerald-400" />
                        <span className="text-text-secondary">Score: {person.healthScore}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Pill size={10} className="text-blue-400" />
                        <span className="text-text-muted">{person.nextMedication}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-400 font-medium">
                      View Dashboard
                    </span>
                    <ChevronRight size={16} className="text-text-muted group-hover:text-text-secondary" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
