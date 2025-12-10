/**
 * Design 2: Timeline Style
 * Date prominently on the left
 */

import {
  Calendar,
  Video,
  MapPin,
  ChevronRight,
  Clock,
  Navigation,
  CalendarPlus,
  User,
} from 'lucide-react';
import type { DesignProps } from '../types';
import { formatTime, getDateParts } from '../utils';
import { handleOpenMaps, handleAddToCalendar } from '../actions';

export default function Design2({
  appointment,
  onViewMore,
  onViewAppointment,
}: DesignProps): React.ReactElement {
  const isTelehealth = appointment.type === 'telehealth';
  const dateParts = getDateParts(appointment.date);

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-info/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />

      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-info/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-theme-md bg-gradient-to-br from-info/15 to-info/5 border border-info/20">
                <Calendar size={20} className="text-info" />
              </div>
              <h3 className="text-lg font-bold text-text-primary">Upcoming</h3>
            </div>
            {onViewMore && (
              <button
                onClick={onViewMore}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-base"
              >
                View all
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Timeline Card */}
          <button
            onClick={() => onViewAppointment?.(appointment.id)}
            className="w-full text-left"
          >
            <div className="flex gap-4">
              {/* Date Block */}
              <div className="flex-shrink-0 w-20">
                <div className="bg-gradient-to-br from-accent via-accent to-info rounded-theme-lg p-3 text-center shadow-lg">
                  <p className="text-xs font-medium text-white/80 uppercase tracking-wide">
                    {dateParts.month}
                  </p>
                  <p className="text-3xl font-bold text-white">{dateParts.day}</p>
                  <p className="text-xs font-medium text-white/80">{dateParts.weekday}</p>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-semibold text-accent">{formatTime(appointment.time)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
                <div className="flex items-start gap-3">
                  {appointment.providerPhoto ? (
                    <img
                      src={appointment.providerPhoto}
                      alt={appointment.providerName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-2 border-border">
                      <User size={20} className="text-accent" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-text-primary">{appointment.providerName}</p>
                        <p className="text-sm text-text-secondary">{appointment.specialty}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                          isTelehealth
                            ? 'bg-accent-muted text-accent'
                            : 'bg-success-muted text-success'
                        }`}
                      >
                        {isTelehealth ? <Video size={10} /> : <MapPin size={10} />}
                        {isTelehealth ? 'Video' : 'In-person'}
                      </span>
                    </div>

                    <p className="text-sm text-text-tertiary mt-2">{appointment.reason}</p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                      <Clock size={12} />
                      <span>{appointment.duration} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Quick Actions Row */}
          <div className="flex gap-2 mt-4 ml-24">
            {!isTelehealth && appointment.location && (
              <button
                onClick={() => handleOpenMaps(appointment.location!)}
                className="flex items-center gap-1.5 py-2 px-3 bg-surface-2 hover:bg-surface-3 border border-border rounded-theme-md transition-all duration-200"
              >
                <Navigation size={14} className="text-success" />
                <span className="text-xs font-medium text-text-secondary">Directions</span>
              </button>
            )}
            {isTelehealth && appointment.videoCallUrl && (
              <a
                href={appointment.videoCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-2 px-3 bg-surface-2 hover:bg-surface-3 border border-border rounded-theme-md transition-all duration-200"
              >
                <Video size={14} className="text-accent" />
                <span className="text-xs font-medium text-text-secondary">Join Call</span>
              </a>
            )}
            <button
              onClick={() => handleAddToCalendar(appointment)}
              className="flex items-center gap-1.5 py-2 px-3 bg-surface-2 hover:bg-surface-3 border border-border rounded-theme-md transition-all duration-200"
            >
              <CalendarPlus size={14} className="text-info" />
              <span className="text-xs font-medium text-text-secondary">Add to Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
