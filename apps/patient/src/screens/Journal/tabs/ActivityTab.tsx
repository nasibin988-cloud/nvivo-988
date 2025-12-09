/**
 * Activity Tab
 * Exercise tracking with intensity levels, weekly stats, and workout history
 */

import { useState } from 'react';
import {
  Dumbbell,
  Flame,
  Clock,
  Calendar,
  Plus,
  X,
  Heart,
  Footprints,
  Bike,
  Waves,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

// Types
type ExerciseType = 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
type Intensity = 'low' | 'moderate' | 'high';
type ViewMode = 'today' | 'week';

interface ExerciseLog {
  id: string;
  name: string;
  type: ExerciseType;
  duration: number; // minutes
  calories: number;
  intensity: Intensity;
  heartRateAvg?: number;
  time: string;
  isAutoDetected?: boolean;
}

interface WeeklyStats {
  totalMinutes: number;
  goalMinutes: number;
  totalCalories: number;
  workouts: number;
  activeDays: number;
  avgHeartRate: number;
}

// Mock data
const mockExercises: ExerciseLog[] = [
  {
    id: '1',
    name: 'Morning Run',
    type: 'cardio',
    duration: 35,
    calories: 320,
    intensity: 'moderate',
    heartRateAvg: 142,
    time: '6:30 AM',
    isAutoDetected: true,
  },
  {
    id: '2',
    name: 'Strength Training',
    type: 'strength',
    duration: 45,
    calories: 280,
    intensity: 'high',
    heartRateAvg: 125,
    time: '5:00 PM',
  },
];

const mockWeeklyStats: WeeklyStats = {
  totalMinutes: 245,
  goalMinutes: 300,
  totalCalories: 1820,
  workouts: 6,
  activeDays: 5,
  avgHeartRate: 128,
};

const mockWeeklyData = [
  { day: 'Mon', minutes: 45, type: 'cardio' },
  { day: 'Tue', minutes: 60, type: 'strength' },
  { day: 'Wed', minutes: 0, type: null },
  { day: 'Thu', minutes: 35, type: 'cardio' },
  { day: 'Fri', minutes: 45, type: 'strength' },
  { day: 'Sat', minutes: 60, type: 'flexibility' },
  { day: 'Sun', minutes: 0, type: null },
];

const exerciseTypes: Record<ExerciseType, { label: string; icon: typeof Dumbbell; color: string }> = {
  cardio: { label: 'Cardio', icon: Heart, color: 'rose' },
  strength: { label: 'Strength', icon: Dumbbell, color: 'blue' },
  flexibility: { label: 'Flexibility', icon: Waves, color: 'purple' },
  sports: { label: 'Sports', icon: Target, color: 'amber' },
  other: { label: 'Other', icon: Sparkles, color: 'emerald' },
};

const intensityConfig: Record<Intensity, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30' },
  moderate: { label: 'Moderate', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
  high: { label: 'High', color: 'text-rose-400', bgColor: 'bg-rose-500/15 border-rose-500/30' },
};

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-surface rounded-xl border border-border p-4">
      <div className={`p-2 rounded-lg ${color} w-fit mb-2`}>
        {icon}
      </div>
      <span className="text-xl font-bold text-text-primary block">{value}</span>
      <span className="text-[10px] text-text-muted uppercase tracking-wider">{label}</span>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise }: { exercise: ExerciseLog }) {
  const typeConfig = exerciseTypes[exercise.type];
  const intensityConf = intensityConfig[exercise.intensity];
  const Icon = typeConfig.icon;

  return (
    <div className="bg-surface rounded-2xl border border-border p-4">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl bg-${typeConfig.color}-500/15 text-${typeConfig.color}-400`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-text-primary">{exercise.name}</span>
            {exercise.isAutoDetected && (
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[9px] font-bold flex items-center gap-0.5">
                <Sparkles size={8} />
                Auto
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-text-muted">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {exercise.time}
            </span>
            <span className="flex items-center gap-1">
              <Flame size={10} className="text-amber-400" />
              {exercise.calories} cal
            </span>
            {exercise.heartRateAvg && (
              <span className="flex items-center gap-1">
                <Heart size={10} className="text-rose-400" />
                {exercise.heartRateAvg} bpm
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-text-primary">{exercise.duration}</span>
          <span className="text-xs text-text-muted block">min</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${intensityConf.bgColor} ${intensityConf.color}`}>
            {intensityConf.label} Intensity
          </span>
          <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-surface-2 text-text-muted">
            {typeConfig.label}
          </span>
        </div>
        <div className="flex gap-1">
          {['low', 'moderate', 'high'].map((level) => (
            <div
              key={level}
              className={`w-1.5 h-4 rounded-full transition-all ${
                (level === 'low' && ['low', 'moderate', 'high'].includes(exercise.intensity)) ||
                (level === 'moderate' && ['moderate', 'high'].includes(exercise.intensity)) ||
                (level === 'high' && exercise.intensity === 'high')
                  ? level === 'low' ? 'bg-emerald-400' : level === 'moderate' ? 'bg-amber-400' : 'bg-rose-400'
                  : 'bg-surface-2'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Quick Activity Button
function QuickActivityButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface border border-border hover:bg-surface-2 transition-all`}
    >
      <div className={`p-2.5 rounded-xl ${color}`}>
        {icon}
      </div>
      <span className="text-xs font-medium text-text-primary">{label}</span>
    </button>
  );
}

// Log Exercise Modal
function LogExerciseModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (exercise: Partial<ExerciseLog>) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ExerciseType>('cardio');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [intensity, setIntensity] = useState<Intensity>('moderate');

  const handleSave = () => {
    if (!name.trim() || !duration) return;
    onSave({
      name: name.trim(),
      type,
      duration: parseInt(duration),
      calories: calories ? parseInt(calories) : Math.round(parseInt(duration) * 8),
      intensity,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface rounded-2xl border border-white/[0.08] overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-text-primary">Log Exercise</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-text-primary transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Activity Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Activity</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Run, Yoga Session"
              className="w-full px-4 py-3 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(exerciseTypes) as ExerciseType[]).map((t) => {
                const config = exerciseTypes[t];
                const Icon = config.icon;
                const isSelected = type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? `bg-${config.color}-500/20 border border-${config.color}-500/30 text-${config.color}-400`
                        : 'bg-surface-2 border border-border text-text-muted hover:bg-surface'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-[9px] font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration & Calories */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Duration</label>
              <div className="relative">
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-sky-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">min</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Calories (opt)</label>
              <div className="relative">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Auto"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm bg-surface-2 border border-border text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-500/50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">cal</span>
              </div>
            </div>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Intensity</label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'moderate', 'high'] as Intensity[]).map((i) => {
                const conf = intensityConfig[i];
                const isSelected = intensity === i;
                return (
                  <button
                    key={i}
                    onClick={() => setIntensity(i)}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all border ${
                      isSelected ? conf.bgColor + ' ' + conf.color : 'bg-surface-2 border-border text-text-muted hover:bg-surface'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border shrink-0">
          <button
            onClick={handleSave}
            disabled={!name.trim() || !duration}
            className="w-full py-3.5 rounded-2xl font-bold text-base bg-gradient-to-r from-sky-500 to-blue-500 text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25"
          >
            Save Exercise
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Activity Tab
export default function ActivityTab() {
  const [view, setView] = useState<ViewMode>('today');
  const [exercises, setExercises] = useState<ExerciseLog[]>(mockExercises);
  const [showLogModal, setShowLogModal] = useState(false);
  const [stats] = useState<WeeklyStats>(mockWeeklyStats);

  const handleSaveExercise = (exercise: Partial<ExerciseLog>) => {
    const newExercise: ExerciseLog = {
      id: Date.now().toString(),
      name: exercise.name || 'Exercise',
      type: exercise.type || 'other',
      duration: exercise.duration || 0,
      calories: exercise.calories || 0,
      intensity: exercise.intensity || 'moderate',
      time: exercise.time || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const todayMinutes = exercises.reduce((sum, e) => sum + e.duration, 0);
  const todayCalories = exercises.reduce((sum, e) => sum + e.calories, 0);
  const progressPercentage = Math.round((stats.totalMinutes / stats.goalMinutes) * 100);

  return (
    <div className="space-y-4 pb-4">
      {/* View Toggle */}
      <div className="flex bg-surface-2 rounded-xl p-1">
        <button
          onClick={() => setView('today')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'today'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => setView('week')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'week'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          This Week
        </button>
      </div>

      {view === 'today' ? (
        <>
          {/* Today's Summary */}
          <div className="bg-surface rounded-2xl border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-lg font-bold text-text-primary mb-1">Today&apos;s Activity</h3>
              <p className="text-xs text-text-muted mb-4">Keep moving, stay healthy</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-sky-500/15 flex items-center justify-center">
                    <Clock size={20} className="text-sky-400" />
                  </div>
                  <span className="text-xl font-bold text-text-primary">{todayMinutes}</span>
                  <span className="text-[10px] text-text-muted block">Minutes</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-500/15 flex items-center justify-center">
                    <Flame size={20} className="text-amber-400" />
                  </div>
                  <span className="text-xl font-bold text-text-primary">{todayCalories}</span>
                  <span className="text-[10px] text-text-muted block">Calories</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-500/15 flex items-center justify-center">
                    <Dumbbell size={20} className="text-emerald-400" />
                  </div>
                  <span className="text-xl font-bold text-text-primary">{exercises.length}</span>
                  <span className="text-[10px] text-text-muted block">Workouts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Activities */}
          <div className="grid grid-cols-4 gap-2">
            <QuickActivityButton
              icon={<Footprints size={18} className="text-rose-400" />}
              label="Walk"
              color="bg-rose-500/15"
              onClick={() => setShowLogModal(true)}
            />
            <QuickActivityButton
              icon={<Bike size={18} className="text-blue-400" />}
              label="Cycle"
              color="bg-blue-500/15"
              onClick={() => setShowLogModal(true)}
            />
            <QuickActivityButton
              icon={<Waves size={18} className="text-purple-400" />}
              label="Yoga"
              color="bg-purple-500/15"
              onClick={() => setShowLogModal(true)}
            />
            <QuickActivityButton
              icon={<Dumbbell size={18} className="text-emerald-400" />}
              label="Gym"
              color="bg-emerald-500/15"
              onClick={() => setShowLogModal(true)}
            />
          </div>

          {/* Log Button */}
          <button
            onClick={() => setShowLogModal(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/30 text-sky-400 hover:from-sky-500/30 hover:to-blue-500/30 transition-all"
          >
            <Plus size={18} />
            <span className="text-sm font-semibold">Log Exercise</span>
          </button>

          {/* Today's Exercises */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Dumbbell size={14} className="text-sky-400" />
              Today&apos;s Workouts
            </h4>
            {exercises.length === 0 ? (
              <div className="text-center py-10 bg-surface rounded-2xl border border-border">
                <Dumbbell size={40} className="mx-auto text-text-muted mb-3" />
                <p className="text-sm text-text-muted">No workouts logged yet</p>
                <p className="text-xs text-text-muted">Get moving and track your progress!</p>
              </div>
            ) : (
              exercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Weekly Progress */}
          <div className="bg-surface rounded-2xl border border-border p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Weekly Goal</h3>
                  <p className="text-xs text-text-muted">{stats.totalMinutes} of {stats.goalMinutes} minutes</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-sky-400">{progressPercentage}%</span>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="flex justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-surface-2"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - progressPercentage / 100)}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0ea5e9" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Trophy size={24} className="text-sky-400 mb-1" />
                    <span className="text-xs text-text-muted">{stats.goalMinutes - stats.totalMinutes} min left</span>
                  </div>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div className="flex items-end justify-between gap-1 h-20">
                {mockWeeklyData.map((day, i) => {
                  const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
                  const hasActivity = day.minutes > 0;
                  const heightPercent = (day.minutes / 60) * 100;
                  return (
                    <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full h-16 bg-surface-2 rounded-lg relative overflow-hidden">
                        {hasActivity && (
                          <div
                            className={`absolute bottom-0 w-full rounded-lg ${
                              day.type === 'cardio' ? 'bg-rose-500' :
                              day.type === 'strength' ? 'bg-blue-500' :
                              day.type === 'flexibility' ? 'bg-purple-500' :
                              'bg-emerald-500'
                            } ${isToday ? 'opacity-100' : 'opacity-60'}`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        )}
                      </div>
                      <span className={`text-[10px] font-medium ${isToday ? 'text-sky-400' : 'text-text-muted'}`}>
                        {day.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Dumbbell size={16} className="text-sky-400" />}
              value={stats.workouts}
              label="Workouts"
              color="bg-sky-500/15 text-sky-400"
            />
            <StatCard
              icon={<Flame size={16} className="text-amber-400" />}
              value={stats.totalCalories.toLocaleString()}
              label="Calories Burned"
              color="bg-amber-500/15 text-amber-400"
            />
            <StatCard
              icon={<Calendar size={16} className="text-emerald-400" />}
              value={stats.activeDays}
              label="Active Days"
              color="bg-emerald-500/15 text-emerald-400"
            />
            <StatCard
              icon={<Heart size={16} className="text-rose-400" />}
              value={stats.avgHeartRate}
              label="Avg Heart Rate"
              color="bg-rose-500/15 text-rose-400"
            />
          </div>

          {/* Activity Type Legend */}
          <div className="bg-surface rounded-xl border border-border p-4">
            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Activity Types</h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="text-[10px] text-text-muted">Cardio</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] text-text-muted">Strength</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] text-text-muted">Flexibility</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-text-muted">Sports</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Log Modal */}
      {showLogModal && (
        <LogExerciseModal onClose={() => setShowLogModal(false)} onSave={handleSaveExercise} />
      )}
    </div>
  );
}
