import { useState } from 'react';
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
  Info,
} from 'lucide-react';
import type { Appointment, AppointmentLocation } from '../../hooks/dashboard';

// =============================================================================
// DESIGN VARIANTS - Set this to 1, 2, or 3 to switch designs
// =============================================================================
export type DesignVariant = 1 | 2 | 3;

interface UpcomingCardProps {
  appointment: Appointment | null | undefined;
  onViewMore?: () => void;
  onViewAppointment?: (id: string) => void;
  design?: DesignVariant;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  }
  if (dateOnly.getTime() === tomorrowOnly.getTime()) {
    return 'Tomorrow';
  }

  // mm/dd/yy format
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getDateParts(dateString: string): { day: string; month: string; weekday: string } {
  const date = new Date(dateString);
  return {
    day: date.getDate().toString(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
  };
}

function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// =============================================================================
// GOOGLE MAPS URL GENERATOR
// =============================================================================

function getGoogleMapsUrl(location: AppointmentLocation): string {
  // Use coordinates if available for precise location
  if (location.coordinates) {
    const { lat, lng } = location.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  // Fallback to address search
  const fullAddress = `${location.address}, ${location.city}, ${location.state} ${location.zip}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
}

// =============================================================================
// GOOGLE CALENDAR URL GENERATOR
// =============================================================================

function getGoogleCalendarUrl(appointment: Appointment): string {
  const startDate = new Date(`${appointment.date}T${appointment.time}`);
  const endDate = new Date(startDate.getTime() + appointment.duration * 60 * 1000);

  // Format dates for Google Calendar (YYYYMMDDTHHMMSS format)
  const formatForGCal = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const start = formatForGCal(startDate);
  const end = formatForGCal(endDate);

  const title = `${appointment.specialty} - ${appointment.providerName}`;
  const details = appointment.notes || appointment.reason;
  const location = appointment.location
    ? `${appointment.location.name}, ${appointment.location.address}, ${appointment.location.city}, ${appointment.location.state}`
    : appointment.videoCallUrl || 'Telehealth';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// =============================================================================
// ACTION HANDLERS
// =============================================================================

function handleOpenMaps(location: AppointmentLocation): void {
  window.open(getGoogleMapsUrl(location), '_blank', 'noopener,noreferrer');
}

function handleAddToCalendar(appointment: Appointment): void {
  window.open(getGoogleCalendarUrl(appointment), '_blank', 'noopener,noreferrer');
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState(): JSX.Element {
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

// =============================================================================
// DESIGN 1: FLOATING CARD - Modern with floating action buttons
// =============================================================================

function Design1({
  appointment,
  onViewMore,
  onViewAppointment,
}: Omit<UpcomingCardProps, 'design'>): JSX.Element {
  const isTelehealth = appointment!.type === 'telehealth';
  const daysUntil = getDaysUntil(appointment!.date);

  return (
    <div className="relative group">
      {/* Outer glow */}
      <div className="absolute -inset-2 bg-gradient-to-br from-info/5 via-transparent to-accent/5 rounded-[32px] opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-700" />

      {/* Main container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 backdrop-blur-2xl rounded-theme-xl border border-border shadow-card">
        {/* Subtle gradient overlay */}
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
            onClick={() => onViewAppointment?.(appointment!.id)}
            className="w-full text-left"
          >
            <div className="bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
              <div className="flex items-start gap-4">
                {/* Provider Photo */}
                <div className="relative flex-shrink-0">
                  {appointment!.providerPhoto ? (
                    <img
                      src={appointment!.providerPhoto}
                      alt={appointment!.providerName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-2 border-border">
                      <User size={24} className="text-accent" />
                    </div>
                  )}
                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 p-1 bg-success rounded-full border-2 border-surface">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                </div>

                {/* Provider Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-text-primary">{appointment!.providerName}</p>
                      <p className="text-sm text-text-secondary">{appointment!.specialty}</p>
                    </div>
                    <span
                      className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium bg-surface-2 border border-border text-text-primary"
                    >
                      {isTelehealth ? 'Video' : 'In-person'}
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-sm text-text-tertiary mt-2 line-clamp-1">
                    {appointment!.reason}
                  </p>
                </div>
              </div>

              {/* Date/Time Row */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-text-tertiary" />
                  <span className="text-sm font-medium text-text-primary">
                    {formatDate(appointment!.date)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-text-tertiary" />
                  <span className="text-sm text-text-secondary">
                    {formatTime(appointment!.time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope size={14} className="text-text-tertiary" />
                  <span className="text-sm text-text-secondary">{appointment!.duration} min</span>
                </div>
              </div>
            </div>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            {/* Maps Button (only for in-person) */}
            {!isTelehealth && appointment!.location && (
              <button
                onClick={() => handleOpenMaps(appointment!.location!)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-surface-2 to-surface-2/80 hover:from-surface-3 hover:to-surface-2 border border-border rounded-theme-md transition-all duration-300 group/btn"
              >
                <Navigation size={16} className="text-text-primary group-hover/btn:scale-110 transition-transform" />
                <span className="text-sm font-medium text-text-primary">Get Directions</span>
              </button>
            )}

            {/* Video Call Button (only for telehealth) */}
            {isTelehealth && appointment!.videoCallUrl && (
              <a
                href={appointment!.videoCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/20 rounded-theme-md transition-all duration-300 group/btn"
              >
                <Video size={16} className="text-accent group-hover/btn:scale-110 transition-transform" />
                <span className="text-sm font-medium text-accent">Join Video Call</span>
              </a>
            )}

            {/* Add to Calendar Button */}
            <button
              onClick={() => handleAddToCalendar(appointment!)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-surface-2 to-surface-2/80 hover:from-surface-3 hover:to-surface-2 border border-border rounded-theme-md transition-all duration-300 group/btn"
            >
              <CalendarPlus size={16} className="text-text-primary group-hover/btn:scale-110 transition-transform" />
              <span className="text-sm font-medium text-text-primary">Add to Calendar</span>
            </button>
          </div>

          {/* Location Preview (for in-person) */}
          {!isTelehealth && appointment!.location && (
            <div className="mt-4 p-3 bg-surface-2/30 rounded-theme-md border border-white/10">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-text-tertiary">
                  <p className="font-medium text-text-secondary">{appointment!.location.name}</p>
                  <p>{appointment!.location.address}, {appointment!.location.city}, {appointment!.location.state}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// DESIGN 2: TIMELINE STYLE - Date prominently on the left
// =============================================================================

function Design2({
  appointment,
  onViewMore,
  onViewAppointment,
}: Omit<UpcomingCardProps, 'design'>): JSX.Element {
  const isTelehealth = appointment!.type === 'telehealth';
  const dateParts = getDateParts(appointment!.date);

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
            onClick={() => onViewAppointment?.(appointment!.id)}
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
                  <p className="text-sm font-semibold text-accent">{formatTime(appointment!.time)}</p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 p-4 hover:bg-surface-2 transition-all duration-300">
                <div className="flex items-start gap-3">
                  {appointment!.providerPhoto ? (
                    <img
                      src={appointment!.providerPhoto}
                      alt={appointment!.providerName}
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
                        <p className="font-semibold text-text-primary">{appointment!.providerName}</p>
                        <p className="text-sm text-text-secondary">{appointment!.specialty}</p>
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

                    <p className="text-sm text-text-tertiary mt-2">{appointment!.reason}</p>

                    <div className="flex items-center gap-2 mt-3 text-xs text-text-muted">
                      <Clock size={12} />
                      <span>{appointment!.duration} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Quick Actions Row */}
          <div className="flex gap-2 mt-4 ml-24">
            {!isTelehealth && appointment!.location && (
              <button
                onClick={() => handleOpenMaps(appointment!.location!)}
                className="flex items-center gap-1.5 py-2 px-3 bg-surface-2 hover:bg-surface-3 border border-border rounded-theme-md transition-all duration-200"
              >
                <Navigation size={14} className="text-success" />
                <span className="text-xs font-medium text-text-secondary">Directions</span>
              </button>
            )}
            {isTelehealth && appointment!.videoCallUrl && (
              <a
                href={appointment!.videoCallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-2 px-3 bg-surface-2 hover:bg-surface-3 border border-border rounded-theme-md transition-all duration-200"
              >
                <Video size={14} className="text-accent" />
                <span className="text-xs font-medium text-text-secondary">Join Call</span>
              </a>
            )}
            <button
              onClick={() => handleAddToCalendar(appointment!)}
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

// =============================================================================
// DESIGN 3: COMPACT HERO - Clean and minimal with expandable details
// =============================================================================

function Design3({
  appointment,
  onViewMore,
  onViewAppointment,
}: Omit<UpcomingCardProps, 'design'>): JSX.Element {
  const [showDetails, setShowDetails] = useState(false);
  const isTelehealth = appointment!.type === 'telehealth';
  const daysUntil = getDaysUntil(appointment!.date);

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
                  {formatDate(appointment!.date)} at {formatTime(appointment!.time)}
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
            onClick={() => onViewAppointment?.(appointment!.id)}
            className="w-full text-left"
          >
            <div className="flex items-center gap-4 p-4 bg-surface-2/50 backdrop-blur-sm rounded-theme-lg border border-white/10 hover:bg-surface-2 transition-all duration-300">
              {appointment!.providerPhoto ? (
                <img
                  src={appointment!.providerPhoto}
                  alt={appointment!.providerName}
                  className="w-16 h-16 rounded-theme-md object-cover border-2 border-border shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-theme-md bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border-2 border-border">
                  <User size={28} className="text-accent" />
                </div>
              )}

              <div className="flex-1">
                <p className="text-lg font-semibold text-text-primary">{appointment!.providerName}</p>
                <p className="text-sm text-text-secondary">{appointment!.specialty}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-tertiary">{appointment!.reason}</span>
                  <span className="text-xs text-text-muted">• {appointment!.duration} min</span>
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
              {appointment!.prepInstructions && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">Preparation</p>
                  <p className="text-xs text-text-tertiary">{appointment!.prepInstructions}</p>
                </div>
              )}
              {!isTelehealth && appointment!.location && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">Location</p>
                  <p className="text-xs text-text-tertiary">
                    {appointment!.location.name}<br />
                    {appointment!.location.address}<br />
                    {appointment!.location.city}, {appointment!.location.state} {appointment!.location.zip}
                  </p>
                </div>
              )}
              {appointment!.notes && (
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">Notes</p>
                  <p className="text-xs text-text-tertiary">{appointment!.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {!isTelehealth && appointment!.location ? (
              <button
                onClick={() => handleOpenMaps(appointment!.location!)}
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-success/10 to-success/5 hover:from-success/20 hover:to-success/10 border border-success/20 rounded-theme-md transition-all duration-300"
              >
                <Navigation size={16} className="text-success" />
                <span className="text-sm font-medium text-success">Get Directions</span>
              </button>
            ) : (
              <a
                href={appointment!.videoCallUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent/10 to-accent/5 hover:from-accent/20 hover:to-accent/10 border border-accent/20 rounded-theme-md transition-all duration-300"
              >
                <Video size={16} className="text-accent" />
                <span className="text-sm font-medium text-accent">Join Call</span>
              </a>
            )}

            <button
              onClick={() => handleAddToCalendar(appointment!)}
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

// =============================================================================
// MAIN COMPONENT - Routes to the selected design
// =============================================================================

export function UpcomingCard({
  appointment,
  onViewMore,
  onViewAppointment,
  design = 1, // Default to Design 1
}: UpcomingCardProps): JSX.Element {
  if (!appointment) {
    return <EmptyState />;
  }

  const props = { appointment, onViewMore, onViewAppointment };

  switch (design) {
    case 1:
      return <Design1 {...props} />;
    case 2:
      return <Design2 {...props} />;
    case 3:
      return <Design3 {...props} />;
    default:
      return <Design1 {...props} />;
  }
}

// =============================================================================
// SKELETON
// =============================================================================

export function UpcomingCardSkeleton(): JSX.Element {
  return (
    <div className="relative">
      <div className="overflow-hidden bg-gradient-to-br from-surface via-surface to-surface-2 rounded-theme-xl border border-border p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 skeleton rounded-theme-md" />
          <div>
            <div className="w-36 h-5 skeleton rounded" />
            <div className="w-20 h-3 skeleton rounded mt-1" />
          </div>
        </div>

        <div className="bg-surface-2/50 rounded-theme-lg border border-white/10 p-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 skeleton rounded-full" />
            <div className="flex-1">
              <div className="w-32 h-4 skeleton rounded" />
              <div className="w-20 h-3 skeleton rounded mt-2" />
              <div className="w-full h-3 skeleton rounded mt-3" />
            </div>
          </div>
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-4 h-4 skeleton rounded" />
                <div className="w-16 h-3 skeleton rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <div className="flex-1 h-12 skeleton rounded-theme-md" />
          <div className="flex-1 h-12 skeleton rounded-theme-md" />
        </div>
      </div>
    </div>
  );
}
