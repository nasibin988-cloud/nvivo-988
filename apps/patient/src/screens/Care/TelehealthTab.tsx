/**
 * Telehealth Tab
 */

import { Video, Calendar, Clock, CheckCircle, Wifi, Mic, Camera, ChevronRight } from 'lucide-react';

// Mock data for telehealth appointments
const upcomingAppointments = [
  {
    id: '1',
    provider: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    date: '12/09/24',
    time: '2:00 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
    isToday: true,
    canJoin: true,
  },
  {
    id: '2',
    provider: 'Dr. Robert Campbell',
    title: 'Psychologist',
    date: '12/20/24',
    time: '11:00 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face&q=80',
    isToday: false,
    canJoin: false,
  },
];

const pastAppointments = [
  {
    id: '3',
    provider: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    date: '11/28/24',
    duration: '25 min',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '4',
    provider: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    date: '11/15/24',
    duration: '30 min',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
  },
];

export default function TelehealthTab() {
  return (
    <div className="space-y-6">
      {/* Device Check Card */}
      <div className="relative bg-gradient-to-br from-emerald-500/[0.08] to-surface rounded-2xl border border-emerald-500/10 p-4 shadow-[0_4px_24px_rgba(16,185,129,0.08)] backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-text-primary">Connection Status</span>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/15 text-xs text-emerald-400 font-medium">
              <CheckCircle size={12} className="fill-emerald-400" />
              Ready
            </span>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.04] backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <Wifi size={14} className="text-emerald-400" />
              <span className="text-xs text-text-secondary">Network</span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.04] backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <Camera size={14} className="text-emerald-400" />
              <span className="text-xs text-text-secondary">Camera</span>
            </div>
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.04] backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <Mic size={14} className="text-emerald-400" />
              <span className="text-xs text-text-secondary">Mic</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-secondary px-1">Upcoming Video Visits</h3>
        {upcomingAppointments.map((apt) => (
          <div
            key={apt.id}
            className={`relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden ${
              apt.canJoin
                ? 'bg-gradient-to-br from-blue-500/[0.06] to-surface border-blue-500/10 shadow-[0_4px_20px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]'
                : 'bg-surface border-white/[0.04] hover:bg-surface-2'
            }`}
          >
            {apt.canJoin && (
              <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            )}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={apt.avatarUrl}
                    alt={apt.provider}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                  />
                  {apt.canJoin && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-surface shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-primary">{apt.provider}</h4>
                  <span className="inline-block px-2.5 py-1 mt-1 rounded-full bg-white/[0.04] text-xs text-text-secondary">
                    {apt.title}
                  </span>
                </div>
                {apt.isToday && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-xs text-emerald-400 font-medium shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                    Today
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03]">
                      <Calendar size={14} className="text-text-muted/70" />
                      <span className="text-sm text-text-secondary">{apt.date}</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03]">
                      <Clock size={14} className="text-text-muted/70" />
                      <span className="text-sm text-text-secondary">{apt.time}</span>
                    </div>
                  </div>
                  {apt.canJoin ? (
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:scale-[1.02] transition-all">
                      <Video size={16} />
                      Join Now
                    </button>
                  ) : (
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary text-sm font-medium hover:bg-white/[0.08] transition-all">
                      <Calendar size={16} />
                      Add to Calendar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Past Appointments */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-secondary px-1">Past Video Visits</h3>
        {pastAppointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-surface rounded-2xl border border-white/[0.04] p-4 hover:bg-surface-2 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <img
                src={apt.avatarUrl}
                alt={apt.provider}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-white/5"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary text-sm">{apt.provider}</h4>
                <span className="inline-block px-2 py-0.5 mt-1 rounded-full bg-white/[0.04] text-xs text-text-muted">
                  {apt.title}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">{apt.date}</p>
                <p className="text-xs text-text-muted mt-0.5">{apt.duration}</p>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-text-secondary transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
