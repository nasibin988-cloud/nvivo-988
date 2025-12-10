/**
 * Design 3: Compact Hero
 * Clean and minimal with expandable details
 */

import { useState } from 'react';
import {
  Video,
  MapPin,
  ChevronRight,
  Clock,
  Navigation,
  CalendarPlus,
  User,
  Info,
} from 'lucide-react';
import type { DesignProps } from '../types';
import { formatDate, formatTime, getDaysUntil } from '../utils';
import { handleOpenMaps, handleAddToCalendar } from '../actions';

export default function Design3({
  appointment,
  onViewMore,
  onViewAppointment,
}: DesignProps): React.ReactElement {
  const [showDetails, setShowDetails] = useState(false);
  const isTelehealth = appointment.type === 'telehealth';
  const daysUntil = getDaysUntil(appointment.date);

  return (
    <div className="relative group">
      <div className="absolute -inset-2 bg-gradient-to-br from-info/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />

      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border shadow-card">
        {/* Hero Gradient Background */}
        <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${
          isTelehealth
            ? 'from-accent/20 via-accent/10 to-transparent'
            : 'from-success/20 via-success/10 to-transparent'
        }`} />

        <div className="relative z-10 p-6">
          {/* Header with Type Badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-theme-md border shadow-sm ${
                isTelehealth
                  ? 'bg-gradient-to-br from-accent/15 to-accent/5 border-accent/20'
                  : 'bg-gradient-to-br from-success/15 to-success/5 border-success/20'
              }`}>
                {isTelehealth ? (
                  <Video size={20} className="text-accent" />
                ) : (
                  <MapPin size={20} className="text-success" />
                )}
              </div>
              <div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isTelehealth ? 'text-accent' : 'text-success'
                }`}>
                  {isTelehealth ? 'Telehealth Visit' : 'In-Person Visit'}
                </span>
                <p className="text-lg font-bold text-text-primary mt-0.5">
                  {formatDate(appointment.date)} at {formatTime(appointment.time)}
                </p>
              </div>
            </div>
            {onViewMore && (
              <button
                onClick={onViewMore}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-base"
              >
                All
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Countdown Badge */}
          {daysUntil <= 7 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-warning-muted border border-warning/20 rounded-full mb-4">
              <Clock size={12} className="text-warning" />
              <span className="text-xs font-medium text-warning">
                {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days away`}
              </span>
            </div>
          )}

          {/* Provider Row */}
          <button
            onClick={() => onViewAppointment?.(appointment.id)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-4 p-4 bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 hover:bg-surface-2 transition-all duration-300">
              {appointment.providerPhoto ? (
                <img
                  src={appointment.providerPhoto}
                  alt={appointment.providerName}
                  className="w-16 h-16 rounded-theme-md object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-theme-md bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-2 border-border">
                  <User size={28} className="text-accent" />
                </div>
              )}

              <div className="flex-1">
                <p className="text-lg font-semibold text-text-primary">{appointment.providerName}</p>
                <p className="text-sm text-text-secondary">{appointment.specialty}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-tertiary">{appointment.reason}</span>
                  <span className="text-xs text-text-muted">• {appointment.duration} min</span>
                </div>
              </div>

              <ChevronRight size={20} className="text-text-tertiary" />
            </div>
          </button>

          {/* Expandable Details */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 mt-3 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <Info size={12} />
            <span>{showDetails ? 'Hide details' : 'Show details'}</span>
            <ChevronRight
              size={12}
              className={`transition-transform ${showDetails ? 'rotate-90' : ''}`}
            />
          </button>

          {showDetails && (
            <div className="mt-3 p-4 bg-surface-2/30 rounded-theme-md border border-white/10 space-y-3">
              {appointment.prepInstructions && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">Preparation</p>
                  <p className="text-xs text-text-tertiary">{appointment.prepInstructions}</p>
                </div>
              )}
              {!isTelehealth && appointment.location && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">Location</p>
                  <p className="text-xs text-text-tertiary">
                    {appointment.location.name}<br />
                    {appointment.location.address}<br />
                    {appointment.location.city}, {appointment.location.state} {appointment.location.zip}
                  </p>
                </div>
              )}
              {appointment.notes && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">Notes</p>
                  <p className="text-xs text-text-tertiary">{appointment.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {!isTelehealth && appointment.location ? (
              <button
                onClick={() => handleOpenMaps(appointment.location!)}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-success/10 to-success/5 hover:from-success/20 hover:to-success/10 border border-success/20 rounded-theme-md transition-all duration-300"
              >
                <Navigation size={16} className="text-success" />
                <span className="text-sm font-medium text-success">Get Directions</span>
              </button>
            ) : (
              <a
                href={appointment.videoCallUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/20 rounded-theme-md transition-all duration-300"
              >
                <Video size={16} className="text-accent" />
                <span className="text-sm font-medium text-accent">Join Call</span>
              </a>
            )}

            <button
              onClick={() => handleAddToCalendar(appointment)}
              className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-info/10 to-info/5 hover:from-info/20 hover:to-info/10 border border-info/20 rounded-theme-md transition-all duration-300"
            >
              <CalendarPlus size={16} className="text-info" />
              <span className="text-sm font-medium text-info">Add to Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
