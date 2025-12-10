/**
 * EmptyState Component
 * Display when no appointments are scheduled
 */

import { Calendar } from 'lucide-react';

export default function EmptyState(): React.ReactElement {
  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-info/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />
      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-theme-md bg-gradient-to-br from-info/15 to-info/5 border border-info/20">
            <Calendar size={20} className="text-info" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Upcoming Appointment</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 rounded-full bg-surface-2 mb-4">
            <Calendar size={32} className="text-text-tertiary" />
          </div>
          <p className="text-text-secondary font-medium">No upcoming appointments</p>
          <p className="text-sm text-text-tertiary mt-1">Schedule a visit with your care team</p>
        </div>
      </div>
    </div>
  );
}
