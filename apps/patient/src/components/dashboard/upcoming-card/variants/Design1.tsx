/**
 * Design 1: Floating Card
 * Modern with floating action buttons
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
  Stethoscope,
  CheckCircle2,
} from 'lucide-react';
import type { DesignProps } from '../types';
import { formatDate, formatTime, getDaysUntil } from '../utils';
import { handleOpenMaps, handleAddToCalendar } from '../actions';

export default function Design1({
  appointment,
  onViewMore,
  onViewAppointment,
}: DesignProps): React.ReactElement {
  const isTelehealth = appointment.type === 'telehealth';
  const daysUntil = getDaysUntil(appointment.date);

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-info/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />

      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-info/[0.02] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-theme-md bg-gradient-to-br from-info/15 to-info/5 border border-info/20 shadow-sm">
                <Calendar size={20} className="text-info" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Next Appointment</h3>
                <p className="text-xs text-text-tertiary">
                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                </p>
              </div>
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

          {/* Provider Card */}
          <button
            onClick={() => onViewAppointment?.(appointment.id)}
            className="w-full text-left"
          >
            <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  {appointment.providerPhoto ? (
                    <img
                      src={appointment.providerPhoto}
                      alt={appointment.providerName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-2 border-border">
                      <User size={24} className="text-accent" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 p-1 bg-success rounded-full border-2 border-surface">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-text-primary">{appointment.providerName}</p>
                      <p className="text-sm text-text-secondary">{appointment.specialty}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium bg-surface-2 border border-border text-text-primary">
                      {isTelehealth ? 'Video' : 'In-person'}
                    </span>
                  </div>

                  <p className="text-sm text-text-tertiary mt-2 line-clamp-1">
                    {appointment.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-text-tertiary" />
                  <span className="text-sm font-medium text-text-primary">
                    {formatDate(appointment.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-tertiary" />
                  <span className="text-sm text-text-secondary">
                    {formatTime(appointment.time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope size={14} className="text-text-tertiary" />
                  <span className="text-sm text-text-secondary">{appointment.duration} min</span>
                </div>
              </div>
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            {!isTelehealth && appointment.location && (
              <button
                onClick={() => handleOpenMaps(appointment.location!)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-surface-2 to-surface-2/80 hover:from-surface-3 hover:to-surface-2 border border-border rounded-theme-md transition-all duration-300 group/btn"
              >
                <Navigation size={16} className="text-text-primary group-hover/btn:scale-110 transition-transform" />
                <span className="text-sm font-medium text-text-primary">Get Directions</span>
              </button>
            )}

            {isTelehealth && appointment.videoCallUrl && (
              <a
                href={appointment.videoCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/20 rounded-theme-md transition-all duration-300 group/btn"
              >
                <Video size={16} className="text-accent group-hover/btn:scale-110 transition-transform" />
                <span className="text-sm font-medium text-accent">Join Video Call</span>
              </a>
            )}

            <button
              onClick={() => handleAddToCalendar(appointment)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-surface-2 to-surface-2/80 hover:from-surface-3 hover:to-surface-2 border border-border rounded-theme-md transition-all duration-300 group/btn"
            >
              <CalendarPlus size={16} className="text-text-primary group-hover/btn:scale-110 transition-transform" />
              <span className="text-sm font-medium text-text-primary">Add to Calendar</span>
            </button>
          </div>

          {/* Location Preview */}
          {!isTelehealth && appointment.location && (
            <div className="mt-4 p-3 bg-surface-2/30 rounded-theme-md border border-white/10">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-text-tertiary">
                  <p className="font-medium text-text-secondary">{appointment.location.name}</p>
                  <p>{appointment.location.address}, {appointment.location.city}, {appointment.location.state}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
