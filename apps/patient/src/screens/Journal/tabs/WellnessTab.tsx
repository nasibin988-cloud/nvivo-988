/**
 * Wellness Tab - Comprehensive Wellness Tracking
 * Features: Voice notes, symptoms, streaks, history, line charts, ambient sounds
 *
 * Modularized version - components extracted to separate files
 */

import { useState, useCallback, useMemo } from 'react';
import { Check, Brain, AlertCircle } from 'lucide-react';
import { ViewToggle } from '@nvivo/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { useWellnessHistory } from '../../../hooks/dashboard/useWellnessLog';
import { VitalityRing } from '../../../components/dashboard/VitalityRing';

// History Components (reusable across tabs)
import {
  HistoryLog,
  StreakData,
  NEGATIVE_TAGS,
  capitalize,
  CalendarHeatmap,
  TimelineFeed,
} from '../components/history';

// Wellness-specific Components
import {
  WellnessTrends,
  WellnessLogModal,
  MindfulnessModule,
  MINDFULNESS_MODULES,
  MindfulnessPlayer,
  MindfulnessCard,
  ScoreDisplay,
  StreakDisplay,
  EmptyState,
} from '../wellness';

// ============================================================================
// SETUP
// ============================================================================

const today = new Date().toISOString().split('T')[0];

const mockStreak: StreakData = {
  currentStreak: 7,
  longestStreak: 14,
  lastActivityDate: today,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WellnessTab(): React.ReactElement {
  const { patientId } = useAuth();
  const { data: firestoreHistory } = useWellnessHistory(patientId);

  // View toggle state
  const [view, setView] = useState<'today' | 'history'>('today');

  // Convert Firestore data to local HistoryLog format
  const history = useMemo(() => {
    if (!firestoreHistory) return {};
    const converted: Record<string, HistoryLog> = {};
    Object.entries(firestoreHistory).forEach(([date, log]) => {
      converted[date] = {
        id: log.id,
        date: log.date,
        mood: log.mood,
        energy: log.energy,
        stress: log.stress,
        sleepQuality: log.sleepQuality,
        sleepHours: log.sleepHours ?? 7,
        symptoms: log.symptoms ?? [],
        notes: log.notes ?? '',
        tags: log.tags ?? [],
        createdAt: new Date().toISOString(),
      };
    });
    return converted;
  }, [firestoreHistory]);

  const [localHistory, setLocalHistory] = useState<Record<string, HistoryLog>>({});
  const [streak, setStreak] = useState<StreakData>(mockStreak);
  const [selectedDate, setSelectedDate] = useState(today);
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeSession, setActiveSession] = useState<MindfulnessModule | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(['mindfulness-11', 'mindfulness-06']);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Merge Firestore history with local (newly saved) history
  const mergedHistory = useMemo(() => ({ ...history, ...localHistory }), [history, localHistory]);

  const selectedLog = mergedHistory[selectedDate] || null;

  const handleSaveLog = useCallback(async (data: Partial<HistoryLog>) => {
    setIsSaving(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      const newLog: HistoryLog = {
        id: selectedDate,
        date: selectedDate,
        mood: data.mood || 7,
        energy: data.energy || 7,
        stress: data.stress || 4,
        sleepQuality: data.sleepQuality || 7,
        sleepHours: data.sleepHours || 7,
        symptoms: data.symptoms || [],
        notes: data.notes || '',
        voiceNoteUrl: data.voiceNoteUrl,
        tags: data.tags || [],
        createdAt: new Date().toISOString(),
      };

      setLocalHistory(prev => ({ ...prev, [selectedDate]: newLog }));
      setShowLogModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Update streak if logging today
      if (selectedDate === today) {
        setStreak(prev => ({
          ...prev,
          currentStreak: prev.currentStreak + 1,
          lastActivityDate: today,
        }));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save log';
      setError(message);
      console.error('Error saving wellness log:', err);
    } finally {
      setIsSaving(false);
    }
  }, [selectedDate]);

  return (
    <div className="space-y-5 pb-4">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <Check size={16} />
          Check-in saved!
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-2 hover:text-rose-300">×</button>
        </div>
      )}

      {/* View Toggle */}
      <ViewToggle
        options={[
          { value: 'today', label: 'Today' },
          { value: 'history', label: 'History' },
        ]}
        value={view}
        onChange={setView}
        color="violet"
        variant="glass"
      />

      {/* TODAY VIEW */}
      {view === 'today' && (
        <>
          {/* Vitality Section with Scores Below */}
          <div className="rounded-2xl p-5 bg-surface border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="mb-4">
              <h3 className="text-base font-bold text-text-primary">Today&apos;s Wellness</h3>
            </div>

            {selectedLog ? (
              <>
                <div className="flex justify-center">
                  <VitalityRing
                    wellnessLog={{
                      id: selectedLog.id,
                      date: selectedLog.date,
                      mood: selectedLog.mood,
                      energy: selectedLog.energy,
                      stress: selectedLog.stress,
                      sleepQuality: selectedLog.sleepQuality,
                      symptoms: selectedLog.symptoms,
                      notes: selectedLog.notes || null,
                    }}
                    size={160}
                    strokeWidth={10}
                    variant={4}
                    animation={1}
                  />
                </div>
                <ScoreDisplay log={selectedLog} />

                {/* Tags + Body signals row with Log button */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-3">
                  {/* Tags and body signals on the left - sorted by length (shorter first) */}
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {/* Positive/Negative Tags - sorted by length */}
                    {[...selectedLog.tags].sort((a, b) => a.length - b.length).map(t => {
                      const isNegative = NEGATIVE_TAGS.includes(t);
                      return (
                        <span
                          key={t}
                          className={`min-w-[88px] px-2.5 py-1 rounded-lg text-[11px] font-medium text-center ${
                            isNegative
                              ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {capitalize(t)}
                        </span>
                      );
                    })}
                    {/* Body signals - sorted by length */}
                    {[...selectedLog.symptoms].sort((a, b) => a.length - b.length).map(s => (
                      <span key={s} className="min-w-[88px] px-2.5 py-1 rounded-lg text-[11px] font-medium text-center bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        {capitalize(s)}
                      </span>
                    ))}
                  </div>
                  {/* Log/Edit button on the right */}
                  <button
                    onClick={() => setShowLogModal(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300 transition-all hover:bg-violet-500/20 active:scale-[0.98] whitespace-nowrap backdrop-blur-sm"
                  >
                    {selectedLog ? 'Edit Log' : 'Log Now'}
                  </button>
                </div>
              </>
            ) : (
              <EmptyState date={selectedDate} onLog={() => setShowLogModal(true)} />
            )}
          </div>

          {/* Streak Display */}
          <StreakDisplay streak={streak} />

          {/* Mindfulness Section (Neuro-Library) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <Brain size={18} />
              </div>
              <h3 className="text-sm font-bold uppercase text-text-primary tracking-widest">Neuro-Library</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MINDFULNESS_MODULES.map((module) => (
                <MindfulnessCard
                  key={module.id}
                  module={module}
                  isFavorite={favoriteIds.includes(module.id)}
                  onToggleFavorite={() => setFavoriteIds(prev =>
                    prev.includes(module.id) ? prev.filter(f => f !== module.id) : [...prev, module.id]
                  )}
                  onPlay={() => setActiveSession(module)}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* HISTORY VIEW */}
      {view === 'history' && (
        <>
          {/* Calendar Heatmap (GitHub-style) */}
          <CalendarHeatmap
            history={mergedHistory}
            onSelectDate={(date) => {
              setSelectedDate(date);
              if (mergedHistory[date]) {
                setShowLogModal(true);
              }
            }}
          />

          {/* Wellness Trends (Charts) */}
          <WellnessTrends history={mergedHistory} />

          {/* Timeline Feed (Recent Entries) */}
          <TimelineFeed
            history={mergedHistory}
            onSelectDate={(date) => {
              setSelectedDate(date);
              setShowLogModal(true);
            }}
          />
        </>
      )}

      {/* Modals */}
      {showLogModal && (
        <WellnessLogModal
          onClose={() => setShowLogModal(false)}
          onSave={handleSaveLog}
          existingLog={selectedLog}
          selectedDate={selectedDate}
          isSaving={isSaving}
        />
      )}

      {activeSession && (
        <MindfulnessPlayer
          module={activeSession}
          onClose={() => setActiveSession(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        /* Glassmorphism slider styling */
        .slider-glass::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.1);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .slider-glass::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.15);
        }
        .slider-glass::-webkit-slider-thumb:active {
          transform: scale(0.95);
        }
        .slider-glass::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.1);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .slider-glass::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.15);
        }
        .slider-glass:focus {
          outline: none;
        }
        .slider-glass::-webkit-slider-runnable-track {
          border-radius: 9999px;
        }
        .slider-glass::-moz-range-track {
          border-radius: 9999px;
        }
      `}</style>
    </div>
  );
}
