/**
 * Care Team Tab
 */

import { MessageSquare, Calendar, Star } from 'lucide-react';

// Color themes for each specialty
const colorThemes = {
  primary: {
    gradient: 'from-emerald-500/[0.08] via-surface to-surface-2',
    border: 'border-emerald-500/15',
    glow: 'bg-emerald-500/10',
    accent: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  cardiology: {
    gradient: 'from-rose-500/[0.08] via-surface to-surface-2',
    border: 'border-rose-500/15',
    glow: 'bg-rose-500/10',
    accent: 'text-rose-400',
    ring: 'ring-rose-500/20',
  },
  neurology: {
    gradient: 'from-violet-500/[0.08] via-surface to-surface-2',
    border: 'border-violet-500/15',
    glow: 'bg-violet-500/10',
    accent: 'text-violet-400',
    ring: 'ring-violet-500/20',
  },
  psychology: {
    gradient: 'from-blue-500/[0.08] via-surface to-surface-2',
    border: 'border-blue-500/15',
    glow: 'bg-blue-500/10',
    accent: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
  nutrition: {
    gradient: 'from-teal-500/[0.08] via-surface to-surface-2',
    border: 'border-teal-500/15',
    glow: 'bg-teal-500/10',
    accent: 'text-teal-400',
    ring: 'ring-teal-500/20',
  },
  coordinator: {
    gradient: 'from-amber-500/[0.08] via-surface to-surface-2',
    border: 'border-amber-500/15',
    glow: 'bg-amber-500/10',
    accent: 'text-amber-400',
    ring: 'ring-amber-500/20',
  },
};

type ColorTheme = keyof typeof colorThemes;

// Mock data for care team members
const mockCareTeam = [
  {
    id: '1',
    name: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    specialty: 'Internal Medicine',
    isPrimary: true,
    nextAppointment: '12/15/24, 10:00 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
    colorTheme: 'primary' as ColorTheme,
  },
  {
    id: '2',
    name: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    specialty: 'Interventional Cardiology',
    isPrimary: false,
    nextAppointment: '12/09/24, 2:00 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
    colorTheme: 'cardiology' as ColorTheme,
  },
  {
    id: '3',
    name: 'Dr. Katherine Mitchell',
    title: 'Neurologist',
    specialty: 'Cognitive Health',
    isPrimary: false,
    nextAppointment: null,
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face&q=80',
    colorTheme: 'neurology' as ColorTheme,
  },
  {
    id: '4',
    name: 'Dr. Robert Campbell',
    title: 'Psychologist',
    specialty: 'Behavioral Health',
    isPrimary: false,
    nextAppointment: '12/20/24, 11:00 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face&q=80',
    colorTheme: 'psychology' as ColorTheme,
  },
  {
    id: '5',
    name: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    specialty: 'Clinical Nutrition',
    isPrimary: false,
    nextAppointment: '12/12/24, 9:30 AM',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
    colorTheme: 'nutrition' as ColorTheme,
  },
  {
    id: '6',
    name: 'Sarah Bennett',
    title: 'Care Coordinator',
    specialty: 'Patient Navigation',
    isPrimary: false,
    nextAppointment: '12/08/24, 4:00 PM',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face&q=80',
    colorTheme: 'coordinator' as ColorTheme,
  },
];

export default function CareTeamTab() {
  return (
    <div className="space-y-3">
        {mockCareTeam.map((member) => {
          const theme = colorThemes[member.colorTheme];
          return (
            <div
              key={member.id}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} ${theme.border} border p-5 hover:scale-[1.01] transition-all duration-300 group`}
            >
              {/* Glow effect */}
              <div className={`absolute top-0 right-0 w-40 h-40 ${theme.glow} rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity`} />

              <div className="relative">
                {/* Primary Badge */}
                {member.isPrimary && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-amber-400/80 uppercase tracking-wider font-medium">Primary Care</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Avatar - Circular */}
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className={`w-14 h-14 rounded-full object-cover ring-2 ${theme.ring}`}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-primary mb-1">{member.name}</h3>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-white/[0.06] text-xs text-text-secondary">
                      {member.title}
                    </span>
                  </div>
                </div>

                {/* Next Appointment */}
                <div className="mt-4 pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white/[0.03]">
                    <Calendar size={14} className="text-text-muted" />
                    {member.nextAppointment ? (
                      <>
                        <span className="text-sm text-text-muted">Next:</span>
                        <span className="text-sm text-text-secondary">{member.nextAppointment}</span>
                      </>
                    ) : (
                      <span className="text-sm text-text-muted">No upcoming appointment</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary text-sm font-medium hover:bg-white/[0.08] hover:text-text-primary transition-all">
                    <MessageSquare size={15} />
                    Message
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-text-secondary text-sm font-medium hover:bg-white/[0.08] hover:text-text-primary transition-all">
                    <Calendar size={15} />
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
