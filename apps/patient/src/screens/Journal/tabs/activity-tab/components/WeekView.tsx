/**
 * Week View Component
 * Shows weekly progress with stats and activity breakdown
 */

import { Dumbbell, Flame, Calendar, Heart, Trophy } from 'lucide-react';
import type { WeeklyStats, DailyActivity } from '../types';
import { StatCard } from './StatCard';

interface WeekViewProps {
  stats: WeeklyStats;
  weeklyData: DailyActivity[];
}

export function WeekView({ stats, weeklyData }: WeekViewProps): React.ReactElement {
  const progressPercentage = Math.round((stats.totalMinutes / stats.goalMinutes) * 100);

  return (
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
            {weeklyData.map((day, i) => {
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
  );
}
