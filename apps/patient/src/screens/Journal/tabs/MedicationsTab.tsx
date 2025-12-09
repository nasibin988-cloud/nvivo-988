/**
 * Medications Tab
 * Medication adherence tracking, scheduling, and history
 */

import { useState } from 'react';
import {
  Pill,
  Clock,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  Calendar,
  Flame,
  ChevronDown,
  Bell,
  Plus,
  Info,
  Target,
  Award,
  CheckCircle2,
  XCircle,
  Timer,
} from 'lucide-react';

// Types
type MedicationStatus = 'taken' | 'pending' | 'missed' | 'upcoming';
type ViewMode = 'today' | 'history';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTime: string;
  instructions?: string;
  purpose?: string;
  status: MedicationStatus;
  takenAt?: string;
}

interface AdherenceData {
  date: string;
  percentage: number;
}

// Mock data
const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    scheduledTime: '8:00 AM',
    instructions: 'Take with food',
    purpose: 'Blood sugar control',
    status: 'taken',
    takenAt: '8:05 AM',
  },
  {
    id: '2',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    scheduledTime: '9:00 AM',
    instructions: 'Can be taken with or without food',
    purpose: 'Blood pressure management',
    status: 'taken',
    takenAt: '9:12 AM',
  },
  {
    id: '3',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    scheduledTime: '8:00 PM',
    instructions: 'Take with dinner',
    purpose: 'Blood sugar control',
    status: 'pending',
  },
  {
    id: '4',
    name: 'Vitamin D3',
    dosage: '2000 IU',
    frequency: 'Once daily',
    scheduledTime: '12:00 PM',
    purpose: 'Vitamin supplementation',
    status: 'upcoming',
  },
];

const mockAdherenceHistory: AdherenceData[] = [
  { date: 'Mon', percentage: 100 },
  { date: 'Tue', percentage: 100 },
  { date: 'Wed', percentage: 75 },
  { date: 'Thu', percentage: 100 },
  { date: 'Fri', percentage: 100 },
  { date: 'Sat', percentage: 50 },
  { date: 'Sun', percentage: 100 },
];

const mock14DayData: AdherenceData[] = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  percentage: Math.random() > 0.2 ? 100 : Math.random() > 0.5 ? 75 : 50,
}));

const statusConfig: Record<MedicationStatus, { label: string; color: string; bgColor: string; icon: typeof Check }> = {
  taken: { label: 'Taken', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30', icon: CheckCircle2 },
  pending: { label: 'Due Now', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30', icon: Timer },
  missed: { label: 'Missed', color: 'text-rose-400', bgColor: 'bg-rose-500/15 border-rose-500/30', icon: XCircle },
  upcoming: { label: 'Upcoming', color: 'text-blue-400', bgColor: 'bg-blue-500/15 border-blue-500/30', icon: Clock },
};

// Medication Card Component
function MedicationCard({
  medication,
  onMarkTaken,
  onMarkMissed,
}: {
  medication: Medication;
  onMarkTaken: (id: string) => void;
  onMarkMissed: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[medication.status];
  const StatusIcon = config.icon;

  return (
    <div className={`bg-surface rounded-2xl border ${medication.status === 'pending' ? 'border-amber-500/30' : 'border-border'} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox / Status */}
          {medication.status === 'pending' ? (
            <button
              onClick={() => onMarkTaken(medication.id)}
              className="w-10 h-10 rounded-xl border-2 border-amber-500/50 flex items-center justify-center hover:bg-amber-500/15 transition-all group shrink-0"
            >
              <Check size={18} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : medication.status === 'taken' ? (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Check size={18} className="text-emerald-400" />
            </div>
          ) : medication.status === 'missed' ? (
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
              <X size={18} className="text-rose-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Clock size={18} className="text-blue-400" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-sm font-semibold ${medication.status === 'taken' ? 'text-text-muted line-through' : 'text-text-primary'}`}>
                {medication.name}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-xs text-text-muted">{medication.dosage} &bull; {medication.frequency}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Clock size={10} />
                {medication.scheduledTime}
              </span>
              {medication.takenAt && (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check size={10} />
                  Taken at {medication.takenAt}
                </span>
              )}
            </div>
          </div>

          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-surface-2 transition-all"
          >
            <ChevronDown
              size={16}
              className={`text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Actions for pending */}
        {medication.status === 'pending' && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border">
            <button
              onClick={() => onMarkTaken(medication.id)}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/25 transition-all"
            >
              <Check size={14} />
              Mark as Taken
            </button>
            <button
              onClick={() => onMarkMissed(medication.id)}
              className="py-2.5 px-4 rounded-xl bg-surface-2 border border-border text-text-muted text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-surface hover:text-text-primary transition-all"
            >
              <X size={14} />
              Skip
            </button>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border mt-0">
          <div className="pt-3 space-y-2">
            {medication.instructions && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-2">
                <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Instructions</span>
                  <span className="text-xs text-text-primary">{medication.instructions}</span>
                </div>
              </div>
            )}
            {medication.purpose && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-2">
                <Target size={14} className="text-purple-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider block mb-0.5">Purpose</span>
                  <span className="text-xs text-text-primary">{medication.purpose}</span>
                </div>
              </div>
            )}
            <button className="w-full py-2 rounded-xl bg-surface-2 border border-border text-text-muted text-xs font-medium flex items-center justify-center gap-1.5 hover:text-text-primary transition-colors">
              <Bell size={12} />
              Set Reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Adherence Chart
function AdherenceChart({ data }: { data: AdherenceData[] }) {
  const avgAdherence = Math.round(data.reduce((sum, d) => sum + d.percentage, 0) / data.length);
  const perfectDays = data.filter(d => d.percentage === 100).length;

  // Calculate current streak
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].percentage === 100) streak++;
    else break;
  }

  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <TrendingUp size={14} className="text-rose-400" />
          14-Day Adherence
        </h3>
        <div className="flex items-center gap-1">
          <Flame size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-amber-400">{streak} day streak</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-1 h-16 mb-4">
        {data.map((day, i) => {
          const isToday = i === data.length - 1;
          const color = day.percentage === 100 ? 'bg-emerald-500' : day.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500';
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-12 bg-surface-2 rounded relative overflow-hidden group cursor-pointer">
                <div
                  className={`absolute bottom-0 w-full rounded transition-all ${color} ${isToday ? 'opacity-100' : 'opacity-70'}`}
                  style={{ height: `${day.percentage}%` }}
                />
                {/* Tooltip */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-bold text-white bg-black/70 px-1 py-0.5 rounded">
                    {day.percentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div className="text-center">
          <span className="text-lg font-bold text-rose-400">{avgAdherence}%</span>
          <span className="text-[9px] text-text-muted block uppercase tracking-wider">Average</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-emerald-400">{perfectDays}</span>
          <span className="text-[9px] text-text-muted block uppercase tracking-wider">Perfect Days</span>
        </div>
        <div className="text-center">
          <span className="text-lg font-bold text-amber-400">{streak}</span>
          <span className="text-[9px] text-text-muted block uppercase tracking-wider">Current Streak</span>
        </div>
      </div>
    </div>
  );
}

// Today's Summary Card
function TodaySummary({
  taken,
  total,
  percentage,
}: {
  taken: number;
  total: number;
  percentage: number;
}) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Today&apos;s Medications</h3>
            <p className="text-xs text-text-muted">Track your daily doses</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-rose-400">{taken}</span>
            <span className="text-lg text-text-muted">/{total}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-surface-2 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              percentage === 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-pink-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>{taken} taken</span>
          <span>{percentage === 100 ? 'All done!' : `${total - taken} remaining`}</span>
        </div>

        {percentage === 100 && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
            <Award size={24} className="text-emerald-400" />
            <div>
              <span className="text-sm font-bold text-emerald-400">Perfect adherence!</span>
              <span className="text-xs text-text-muted block">You&apos;ve taken all medications today</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Medications Tab
export default function MedicationsTab() {
  const [view, setView] = useState<ViewMode>('today');
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const handleMarkTaken = (id: string) => {
    setMedications(prev => prev.map(m =>
      m.id === id
        ? { ...m, status: 'taken' as MedicationStatus, takenAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }
        : m
    ));
  };

  const handleMarkMissed = (id: string) => {
    setMedications(prev => prev.map(m =>
      m.id === id ? { ...m, status: 'missed' as MedicationStatus } : m
    ));
  };

  const takenCount = medications.filter(m => m.status === 'taken').length;
  const totalCount = medications.length;
  const adherencePercentage = Math.round((takenCount / totalCount) * 100);

  // Group medications by status
  const pendingMeds = medications.filter(m => m.status === 'pending');
  const upcomingMeds = medications.filter(m => m.status === 'upcoming');
  const completedMeds = medications.filter(m => m.status === 'taken' || m.status === 'missed');

  return (
    <div className="space-y-4 pb-4">
      {/* View Toggle */}
      <div className="flex bg-surface-2 rounded-xl p-1">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'today'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView('history')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'history'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          History
        </button>
      </div>

      {view === 'today' ? (
        <>
          {/* Today's Summary */}
          <TodaySummary taken={takenCount} total={totalCount} percentage={adherencePercentage} />

          {/* Pending Medications */}
          {pendingMeds.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertCircle size={14} />
                Due Now ({pendingMeds.length})
              </h4>
              {pendingMeds.map((med) => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  onMarkTaken={handleMarkTaken}
                  onMarkMissed={handleMarkMissed}
                />
              ))}
            </div>
          )}

          {/* Upcoming Medications */}
          {upcomingMeds.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                <Clock size={14} />
                Coming Up ({upcomingMeds.length})
              </h4>
              {upcomingMeds.map((med) => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  onMarkTaken={handleMarkTaken}
                  onMarkMissed={handleMarkMissed}
                />
              ))}
            </div>
          )}

          {/* Completed Medications */}
          {completedMeds.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-text-muted flex items-center gap-2">
                <Check size={14} />
                Completed ({completedMeds.length})
              </h4>
              {completedMeds.map((med) => (
                <MedicationCard
                  key={med.id}
                  medication={med}
                  onMarkTaken={handleMarkTaken}
                  onMarkMissed={handleMarkMissed}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {medications.length === 0 && (
            <div className="text-center py-10 bg-surface rounded-2xl border border-border">
              <Pill size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-sm text-text-muted">No medications scheduled</p>
              <p className="text-xs text-text-muted">Your medications will appear here</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Adherence Chart */}
          <AdherenceChart data={mock14DayData} />

          {/* Weekly Summary */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <Calendar size={14} className="text-rose-400" />
              This Week
            </h3>
            <div className="flex items-end justify-between gap-2 h-24 mb-2">
              {mockAdherenceHistory.map((day, i) => {
                const isToday = i === mockAdherenceHistory.length - 1;
                const color = day.percentage === 100 ? 'bg-emerald-500' : day.percentage >= 75 ? 'bg-amber-500' : 'bg-rose-500';
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-muted">{day.percentage}%</span>
                    <div className="w-full h-20 bg-surface-2 rounded-lg relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 w-full rounded-lg ${color} ${isToday ? 'opacity-100' : 'opacity-70'}`}
                        style={{ height: `${day.percentage}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-medium ${isToday ? 'text-rose-400' : 'text-text-muted'}`}>
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-text-muted">100%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] text-text-muted">75%+</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] text-text-muted">&lt;75%</span>
              </div>
            </div>
          </div>

          {/* Medication List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Pill size={14} className="text-rose-400" />
              Your Medications
            </h4>
            <div className="space-y-2">
              {['Metformin', 'Lisinopril', 'Vitamin D3'].map((name, i) => (
                <div key={name} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                      <Pill size={18} className="text-rose-400" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text-primary">{name}</span>
                      <span className="text-xs text-text-muted block">
                        {i === 0 ? '500mg • Twice daily' : i === 1 ? '10mg • Once daily' : '2000 IU • Once daily'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-400">{95 - i * 3}%</span>
                    <span className="text-[10px] text-text-muted block">Adherence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
